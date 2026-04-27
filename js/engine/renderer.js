/**
 * Raycasting and 3D picking utilities for clicking on city markers.
 */
const Picker = (function () {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function getIntersectedCity(event, camera, markerGroup, activeCities) {
        const rect = GlobeEngine.getRenderer().domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Check against city marker meshes
        const meshes = [];
        markerGroup.children.forEach(child => {
            if (child.userData && child.userData.cityId !== undefined) {
                meshes.push(child);
            }
        });

        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
            const cityId = intersects[0].object.userData.cityId;
            return activeCities.find(c => c.id === cityId) || null;
        }
        return null;
    }

    function screenPosition(worldPos, camera, renderer) {
        const v = worldPos.clone().project(camera);
        const w = renderer.domElement.clientWidth;
        const h = renderer.domElement.clientHeight;
        return {
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h
        };
    }

    return { getIntersectedCity, screenPosition };
})();
