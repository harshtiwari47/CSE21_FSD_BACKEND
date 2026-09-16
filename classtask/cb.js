const log = (name, cb) => {
    cb(name);
}

const ftn = (name) => {
    console.log(`Hello, ${name}!`);
}

log('Alice', ftn);