//create one promises that will display user name and password
//using resolve and if data willbe rejected its display error message
// 
//async /await
console.log("this is async/await");
async function test(){
 console.log("1");
 await console.log("2");
 console.log("3");
 console.log("4");

}
test().then((res)=>{
console.log(res);

}).catch(()=>{

})
console.log("6");

