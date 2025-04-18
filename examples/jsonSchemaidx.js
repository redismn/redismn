import redis_exp from "../src/index.js";


const redis=new redis_exp("localhost",6379);
await redis.start();

await redis.jsonSchemaIdx("Us",[{
    key_name:"id",
    tag_type:"NUMERIC",
    sortable: true,
}, {
    key_name:"first_name",
    tag_type:"TEXT",
    sortable:true
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
},{
    key_name: "friends",
    tag_type:"TEXT",
    arr_type:"TEXT"
}]);

redis.jsonset("jay",{
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
    friends:["ab","dggd","sgsgs"]
},"Us",12000);

redis.jsonset("jay3",{
    first_name:"Jay3",
    last_name:"Singh3",
    email:"jay@jay3.com",
    gender:"male",
    age:35,
    friends:["ab","dggd","sgsgs"]
},"Us",12000);

redis.jsonset("jay4",{
    first_name:"Jay4",
    last_name:"Singh4",
    email:"jay@jay4.com",
    gender:"male",
    age:68,
    friends:["ab","dggd","sgsgs"]
},"Us",12000);

redis.jsonset("jay5",{
    first_name:"Jay5",
    last_name:"Singh5",
    email:"jay@jay5.com",
    gender:"male",
    age:19,
    friends:["ab","dggd","sgsgs"]
},"Us",12000);
