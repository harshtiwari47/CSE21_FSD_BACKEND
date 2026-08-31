class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
      this.events.get(event).push(listener);
    }
  }

  off(event, listener) {
    if (this.events.has(event)) {
      this.events.get(event) = this.events.get(event).filter(list => list !== listener);
    }
  }

  emit(event, ...args) {
    if (this.events.has(event)) {
      for (const [_, ftns] of this.events) {
        ftns.forEach((cb) => {
          cb(...args);
        });
      }
    }
  }
}

const eventListener = new EventEmitter();

eventListener.on("greet", (name) => {
  console.log(name);
});

eventListener.emit("greet", "harsh");
