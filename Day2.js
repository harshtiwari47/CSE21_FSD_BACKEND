//Synchronous and asynchronous programming
//synchronous programming: code is executed line by line, one after another
// console.log("java script");
// function hello(){
//     console.log("Hello, World!");
// }
// hello();
// console.log("This is synchronous programming");
//Async programming: code is executed line by line, but some code is executed in the background and does not block the execution of other code
//setTimeout():function that is used to execute a function after a specified time
// const hello = () => {
//     setTimeout(() => {
//         console.log("Hello, World!");
//     }, 2000);

// }
// hello();
// console.log("This is asynchronous programming");
// //callback,promises,async/await
// function add(n1,n2,callback){
//     console.log(n1+n2);
//     callback();
// }
// let a=10;
// let b=20;
// add(a,b,sayHi);
// add(a,b,hello);
//  //add(hello,sayHi);
// function sayHi(){
//     console.log("this is callback function");
// }
// function hello(){
//     console.log("Hello, World!");
// }
//create a function display(callback) that print "welcome to ABES",then call callback which print learning "FSD in cse 21"
