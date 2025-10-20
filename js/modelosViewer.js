// Importações necessárias do Three.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Seleciona o modal e elementos
const modal = document.getElementById("viewerModal");
const closeBtn = document.querySelector(".close-viewer");
const viewerContainer = document.getElementById("viewerContainer");

let renderer, scene, camera, controls, currentModel;
let animationId = null; // <- controla o loop ativo

function criarRenderer(width, height) {
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  viewerContainer.appendChild(renderer.domElement);
}

function ajustarCameraEControles(width, height) {
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
}

function centralizarModelo(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  model.position.x -= center.x;
  model.position.y -= center.y;
  model.position.z -= center.z;

  const maxDim = Math.max(size.x, size.y, size.z);
  const camZ = Math.max(2.2 * maxDim, 3.5);
  camera.position.set(0, Math.max(1, size.y * 0.6), camZ);
  controls.target.set(0, 0, 0);
  controls.update();
}

function iniciarAnimacao() {
  if (animationId) cancelAnimationFrame(animationId); // cancela loop antigo
  function animate() {
    animationId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

function abrirViewer(modelPath) {
  // limpa container e cena anterior
  viewerContainer.innerHTML = "";
  scene = new THREE.Scene();

  const viewerContent = document.querySelector(".viewer-content");
  viewerContent.classList.remove("mapa-model");
  if (modelPath.toLowerCase() === "mapa.glb") {
    viewerContent.classList.add("mapa-model");
  }

  const width = Math.max(400, Math.floor(viewerContainer.clientWidth));
  const height = Math.max(300, Math.floor(viewerContainer.clientHeight));
  criarRenderer(width, height);
  ajustarCameraEControles(width, height);

  // luzes
  const hemi = new THREE.HemisphereLight(0xffffff, 0x666666, 1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(10, 15, 10);
  scene.add(key);

  const loader = new GLTFLoader();

  // loader.register((parser) => {
  //   return {
  //     beforeRoot: (gltf) => {
  //       gltf.nodes = gltf.nodes.filter((n) => n !== null); // remove nós nulos
  //     },
  //   };
  // });

  loader.load(
    `./models/${modelPath}`,
    (gltf) => {
      currentModel = gltf.scene;

      // escala automática
      const box = new THREE.Box3().setFromObject(currentModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      currentModel.scale.set(scale, scale, scale);

      scene.add(currentModel);
      centralizarModelo(currentModel);
      iniciarAnimacao(); // inicia animação só depois que carrega o modelo
    },
    undefined,
    (error) => {
      console.error("Erro ao carregar modelo:", error);
      viewerContainer.innerHTML =
        "<p style='color:#ffcfa0;'>Erro ao carregar o modelo.</p>";
    }
  );
}

// abre o modal
document.querySelectorAll(".modelo-card").forEach((card) => {
  card.addEventListener("click", () => {
    const modelFile = card.getAttribute("data-model");
    modal.classList.add("active");
    abrirViewer(modelFile);
  });
});

// função auxiliar para fechar modal
function fecharModal() {
  modal.classList.remove("active");
  viewerContainer.innerHTML = "";
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode)
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    renderer = null;
  }
  scene = null;
  camera = null;
  controls = null;
}

// botão fechar
closeBtn.addEventListener("click", fecharModal);

// fechar clicando fora
window.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});

// ajuste no resize
window.addEventListener("resize", () => {
  if (!renderer || !viewerContainer) return;
  const width = Math.max(400, Math.floor(viewerContainer.clientWidth));
  const height = Math.max(300, Math.floor(viewerContainer.clientHeight));
  renderer.setSize(width, height);
  if (camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
});
