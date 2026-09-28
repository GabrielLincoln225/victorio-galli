/**
 * Fila de montagem das animações. Cada seção monta suas timelines numa tarefa própria,
 * em ordem de página (a hero primeiro), em vez de tudo no mesmo commit da hidratação.
 * Assim a main thread não trava num bloco longo em celulares mais lentos.
 */
type Job = () => void;

const queue: Job[] = [];
const idle: Job[] = [];
let scheduled = false;

function pump() {
  const job = queue.shift();
  if (job) job();
  if (queue.length) {
    setTimeout(pump, 0);
  } else {
    scheduled = false;
    idle.splice(0).forEach((fn) => fn());
  }
}

/** Agenda uma montagem; devolve o cancelamento (para o cleanup do useGSAP). */
export function enqueue(job: Job) {
  queue.push(job);
  if (!scheduled) {
    scheduled = true;
    setTimeout(pump, 0);
  }
  return () => {
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
  };
}

/** Roda quando a fila esvaziar (ex.: um único ScrollTrigger.refresh no fim). */
export function whenQueueIdle(fn: Job) {
  if (!scheduled && !queue.length) setTimeout(fn, 0);
  else idle.push(fn);
}

/**
 * Para usar dentro do useGSAP: a montagem roda depois, mas registrada no mesmo
 * contexto (contextSafe), então o cleanup do componente continua revertendo tudo.
 */
export function deferSetup(contextSafe: (fn: Job) => Job, setup: () => void | (() => void)) {
  return enqueue(contextSafe(setup as Job));
}
