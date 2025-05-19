import redis_exp from "../src/index.js";
const redis =new redis_exp("localhost","6379");
await redis.start();
await redis.jsonSchemaIdx("Us",[{
    key_name:"id",
    tag_type:"NUMERIC",
    sortable: true,
}, {
    key_name:"depth",
    tag_type:"NESTED",
    nested_address:"friends[*].name",
    nested_type:"TEXT",

},{
    key_name:"last_name",
    tag_type:"TEXT"
},{
    key_name:"email",
    tag_type:"TAG"
},{
    key_name:"gender",
    tag_type:"TAG"
},{
    key_name:"age",
    tag_type:"NUMERIC",
    sortable:true
}]);

await redis.jsonset("jay",{
    first_name:"Jay",
    last_name:"Singh",
    email:"jay@jay.com",
    gender:"male",
    age:12,
},"Us",12000);

redis.jsonset("jay2",{
    first_name:"Jay2",
    last_name:"Singh",
    email:"jay@jay2.com",
    gender:"male",
    age:12,
},"Us",12000);

redis.jsonset("jay3",{
    first_name:"Jay3",
    last_name:"Singh3",
    email:"jay@jay3.com",
    gender:"male",
    age:35,
    friends:[{name:"ab"},{name:"dggd"},{name:"sgsgs"}]
},"Us",12000);

redis.jsonset("jay4",{
    first_name:"Jay4",
    last_name:"Singh4",
    email:"jay@jay4.com",
    gender:"male",
    age:68,
    friends:[{name:"ab"},{name:"dggd"},{name:"sgsgs"}]
},"Us",12000);

redis.jsonset("jay5",{
    first_name:"Jay5",
    last_name:"Singh5",
    email:"jay@jay5.com",
    gender:"male",
    age:19,
    friends:[{name:"ab"},{name:"dggd"},{name:"sgsgs"}]
},"Us",12000);

let result=await redis.jsonquery("gender","{male}","Us");
console.log(result);

