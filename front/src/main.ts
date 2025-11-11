import './style.css'

let IS_LEFT_MOUSEDOWN = false
const MAX_NODE_WIDTH = '200px'

interface IJSONData {
  [key: string | number]: string | string[] | number[] | number | IJSONData
}

const jsonData: IJSONData = {
  parent1: {
    name: 'parent1',
    child1_1: {
      name: 'child1'
    }
  },
  parent2: {
    name: 'parent2',
    child2_1: {
      name: 'child2_1'
    }
  }
}

const prepareData = (jsonData: IJSONData) => {
let currentInherritanceLevel = 0
}

// Просчитать максимальную вложенность исходных данных = колличество колонок
// Подготовить классы элементов и их свойства, просчитать высоту каждого элемента= контент, футеры, паддинги, + Gap; записать их и прописать from to
// Взять за высоту канваса самую высокую вложенность

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.style.width = '7000px'

const ctx2d = canvas.getContext('2d') as CanvasRenderingContext2D

const rects = []

  ctx2d.fillStyle = "red";
  ctx2d.fillRect(1, 100, 20, 20);
  ctx2d.fillStyle = "red";
  ctx2d.fillRect(200, 100, 8, 200)


canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) IS_LEFT_MOUSEDOWN = true
})

canvas.addEventListener('mouseup', (e) => {
  if (e.button === 0) IS_LEFT_MOUSEDOWN = false
})

canvas.addEventListener('mousemove', (e) => {
  if (IS_LEFT_MOUSEDOWN) {
    console.log('mooves', e)
  }
})

console.log(ctx2d)


const zero = performance.now();

function tick() {
  const value = (performance.now() - zero);
  // console.log(value)

  requestAnimationFrame(tick);
}

tick()
