export default class hset{
    constructor(redis_client){
        this.client=redis_client;
    }
    async hsetSchemaIdx(model_nameorcustom,key_tag_arr){
//    [ {key_name:value,
//         tag_type:value,
//              arr_type:value()same as tag type only use when array tag is used
//    }
//     ]
//     availble tags=["TEXT","NUMERIC,"ARRAY","TAG",EXtras]
//         availlble "HASH",
        let create=[model_nameorcustom,"ON","HASH","PREFIX",1,model_nameorcustom+":","SCHEMA"]
        key_tag_arr.forEach((pair)=>{
            if (!pair.tag_type || !pair.key_name ){
                throw new Error("missing tag_type or key_name")
            }
            if(pair.tag_type=="ARRAY"){
                if (pair.arr_type!=undefined){
                    create.push(`$.${pair.key_name}[*]`,"AS",pair.key_name,pair.arr_type)   //$.first_name","AS","first_name","TEXT"

                }else{
                    create.push(`$.${pair.key_name}`,"AS",pair.key_name,"TAG");
                }

            }else{
                create.push(`$.${pair.key_name}`,"AS",pair.key_name,pair.tag_type);
            }
        });
        this.client.call("FT.CREATE",...create);
    }
    async  set(key,val$jsonobj,model_nameorcustom,ttl){
        await this.client.hset(`${model_nameorcustom}:${key}`,val$jsonobj);
    }
    async update(key,val$jsonobj,model_nameorcustom,ttl){
        await this.client.hset(`${model_nameorcustom}:${val$jsonobj}`,val$jsonobj);
    }
    async get(key,model_nameorcustom,ttl){
        await this.client.hgetall(model_nameorcustom+":"+key);
    }
    async multipleget(key,model_nameorcustom,required_key_arr){
        await this.client.hmget(model_nameorcustom+":"+key,...required_key_arr);
    }
    async hsetoneget(key,model_nameorcustom,required_key_arr){
        await this.client.hmget(model_nameorcustom+":"+key,...required_key_arr);
    }


}