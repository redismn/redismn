import redis_exp from "redismn";

const redis=new redis_exp("localhost","6379");
await redis.start();

await redis.jsonset("abc234",{"name":"abhay",friends:["abhay","aaa","shivam"]},"USER",20);
const result=await redis.where("USER",676).jsonget("abc234","").jsonset("abc234",{"name":"abghghhay",friends:["abhay","aaa","shivam"]}).jsonset("abchg234",{"name":"abhghay",friends:["abhay","aaa","shivam"]}).jsonset("abc2gh34",{"name":"abhay",friends:["abhay","aaa","shivam"]}).exec()
// here every jsonget will executed at end of jsonset so you can even fetch added in this transition.
//  exec() must be called at last.

