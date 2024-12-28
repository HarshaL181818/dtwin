import { useRef } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import Model from './component/OfficeComponent/Warehouse'
import SingleTowerOffice from './component/OfficeComponent/SingleTower'
import TwinTowerOffice from './component/OfficeComponent/TwinTowerOffice'
import BuildingGroup from './component/ResidentialComponent/ResidentialBuildings'
import ApartmentBuilding from './component/ResidentialComponent/ApartmentComplex'
import ModernOffice from './component/OfficeComponent/ModernOffice'
import FootPathLayout from './component/PathComponent/FootPath'
import GrassPlane from './component/PathComponent/Grass'
import RoadLayout from './component/PathComponent/RoadComponent'
import TilesLayout from './component/PathComponent/RubberTiles'
import CarModel from './component/CarComponent/CarModel'
import CarModelWithStop from './component/CarComponent/BusModel'
import SportModel from './component/CarComponent/SportModel'
import MultiModelAnimation from './component/CarComponent/MultiModelAnimation'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { OrbitControls } from '@react-three/drei'

function CitySceneCanvas() {
   const carRoadPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, 0, 50),
    new THREE.Vector3(2, 0, -1),
    new THREE.Vector3(50, 0, -5),
  ]);

  const busRoadPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3, 0, -45),
    new THREE.Vector3(3, 0, 40),
  ]);

  const sportCarPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, 0, 36),
    new THREE.Vector3(-3, 0, -50),
  ]);

  // Load models
  const carModel = useLoader(GLTFLoader, "/pink_car.gltf");
  const busModel = useLoader(GLTFLoader, "/bus.gltf");
  const sportCarModel = useLoader(GLTFLoader, "/sport_car.gltf");

  // Model data
  const modelsWithPaths = [
    {
      ref: useRef(null),
      scene: carModel.scene,
      roadPath: carRoadPath,
      scale: [2.5, 2.5, 2.5],
    },
    {
      ref: useRef(null),
      scene: busModel.scene,
      roadPath: busRoadPath,
      scale: [1.8, 1.8, 1.8],
      shouldPause: true, // This model will pause
      pauseDuration: 175, // Pause duration in ms
      rotation: [0,-Math.PI/2,0]
    },
    {
      ref: useRef(null),
      scene: sportCarModel.scene,
      roadPath: sportCarPath,
      scale: [1.5, 1.5, 1.5],
    },
  ];
  return (
    <>
    <div style={{ width: '100vw', height: '80vh' }}>
      <Canvas camera={{ position: [80, 80, 108], fov: 12 }} onCreated={({ camera }) => { camera.layers.enable(1); }}  >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[27,17,19]} intensity={100} />
        <pointLight position={[31,19,19]} intensity={100} />
        <pointLight position={[14,12,-14]} intensity={100} />
        <pointLight position={[16,14,-14]} intensity={100} />
        <pointLight position={[14,8,-14]} intensity={100} />
        <pointLight position={[27,19,-14]} intensity={100} />
        <pointLight position={[27,12,-14]} intensity={100} />
        <pointLight position={[27,7,-14]} intensity={100} />
        <pointLight position={[36,10,-12]} intensity={100} />
        <pointLight position={[36,14,-12]} intensity={100} />
        <pointLight position={[36,6,-12]} intensity={100} />
        <Model />
        <SingleTowerOffice />
        <TwinTowerOffice position={[32,0,-18]}/>
        <BuildingGroup position={[0,0,34]} />
        <BuildingGroup position={[-30,0,-30]} />
        <BuildingGroup position={[0,0,-30]} />
        <ApartmentBuilding />
        <ApartmentBuilding position={[-60, 0, 22]} />
        <ModernOffice position={[17,0,-18]}/>
        <FootPathLayout />
        <GrassPlane />
        <RoadLayout />
        <TilesLayout />
        <MultiModelAnimation modelsWithPaths={modelsWithPaths} />
      {/* <SportModel roadPath={sportCarPath} />
        <CarModel roadPath={carRoadPath} />
        <CarModelWithStop roadPath={busRoadPath}/>
        <OrbitControls /> */}
      </Canvas>
    </div>
    </>
  )
}

export default CitySceneCanvas
