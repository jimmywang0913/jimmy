class Spacecraft extends SceneNode {
    constructor(scene, assetsManager, camera) {
        super(scene, assetsManager)
        this.camera = camera
    }

    setup() {
        this.model = initPhysics(new BABYLON.MeshBuilder.CreateBox("spacecraft", { width: 200, height: 200, depth: 200 }, this.scene),
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 10 },
            this.scene);
        this.model.visibility = false;
        this.model.position = new BABYLON.Vector3(0, 0, 2500);
        this.model.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI);
        this.model.scaling = new BABYLON.Vector3(0.001, 0.001, 0.001)
        this.hideground = new BABYLON.MeshBuilder.CreateGround("", { width: 0.1, height: 0.1 }, this.scene)
        this.hideground.parent = this.model;

        this.assetsManager.addMeshTask('meshs', "", "mesh/", "aero4.obj").onSuccess = (function (task) {

            task.loadedMeshes.forEach(mesh => {
                mesh.checkCollisions = true;
                // leave meshes already parented to maintain model hierarchy:
                if (!mesh.parent) {
                    mesh.parent = this.model
                }
            });

            makePhysicsObject(this.model, this.scene, 1);

        }).bind(this)
    }

    update() {
        if (this.model != null) {
            this.translateByInput();
            this.rotateByMouse();
            this.fitCam();
        }
    }

    fitCam() {
        this.camera.position.copyFrom(this.model.position.subtract(this.model.forward.scale(1.2)).add(new BABYLON.Vector3(0, 0.1, 0)))
        this.camera.setTarget(this.model.position)
    }

    translateByInput() {
        let vel = 1;
        let pos = this.hideground.position
        let norm = this.hideground.getNormalAtCoordinates(pos.x, pos.z);
        let view = this.model.position.subtract(this.camera.position);
        let rightV = BABYLON.Vector3.Cross(norm, view);
        if (this.scene.inputMap["w"]) {
            this.model.translate(
                view.multiplyByFloats(vel, vel, vel)
                , 10
                , BABYLON.Space.WORLD);
        }
        if (this.scene.inputMap["a"]) {
            this.model.translate(
                rightV.multiplyByFloats(-vel, -vel, -vel)
                , 10
                , BABYLON.Space.WORLD);
        }
        if (this.scene.inputMap["s"]) {
            this.model.translate(
                view.multiplyByFloats(-vel, -vel, -vel)
                , 10
                , BABYLON.Space.WORLD);
        }
        if (this.scene.inputMap["d"]) {
            this.model.translate(
                rightV.multiplyByFloats(vel, vel, vel)
                , 10
                , BABYLON.Space.WORLD);
        }
        if (this.scene.inputMap["r"]) {
            this.model.lookAt(BABYLON.Vector3.Zero())
        }
    }

    rotateByMouse() {
        let dx = SceneMain.scene.pointerX - canvas.width / 2;
        let dy = (SceneMain.scene.pointerY - canvas.height / 2);
        let sen = 0.1;
        let rot = Math.PI / 300;

        // if (Math.abs(dx) > canvas.width * 0.3 || Math.abs(dy) > canvas.height * 0.3) {
        //     let theta = Math.atan(dy / dx);
        //     console.log(dx, dy, theta);
        //     this.spacecraft.model.rotate(new BABYLON.Vector3(dy, dx, 0).normalize(), Math.PI / 120, BABYLON.Space.LOCAL);
        // }
        // this.spacecraft.model.rotate(new BABYLON.Vector3(dy, -dx, 0).normalize(), Math.PI / 120, BABYLON.Space.LOCAL);
        if (Math.abs(dx) > canvas.width * sen) {
            let pos = this.hideground.position
            let norm = this.hideground.getNormalAtCoordinates(pos.x, pos.z);
            this.model.rotate(norm, dx / Math.abs(dx) * rot, BABYLON.Space.WORLD);
            this.hideground.rotate(norm, dx / Math.abs(dx) * rot, BABYLON.Space.WORLD);
        }
        if (Math.abs(dy) > canvas.height * sen) {
            let pos = this.hideground.position
            let norm = this.hideground.getNormalAtCoordinates(pos.x, pos.z);
            let view = this.model.position.subtract(this.camera.position);
            let targetV = BABYLON.Vector3.Cross(norm, view);
            this.model.rotate(targetV, dy / Math.abs(dy) * rot, BABYLON.Space.WORLD);
            this.hideground.rotate(targetV, dy / Math.abs(dy) * rot, BABYLON.Space.WORLD);
        }
        // if (this.camera.absoluteRotation.normalize().equals(new BABYLON.Vector3(0, 1, 0)) ||
        //     this.camera.absoluteRotation.normalize().equals(new BABYLON.Vector3(0, -1, 0))) {
        //     this.model.rotation = BABYLON.Vector3.Zero();
        //     this.hideground.rotation = BABYLON.Vector3.Zero();
        // }
    }
}