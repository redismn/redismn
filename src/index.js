import ioRedis from "ioredis";


export default class redis_exp{
    constructor(url,port){
     this.client=new ioRedis({
         host:url,
         port:port
     })
}
async start(){
     await  this.#startUP()  ;
}
async #startUP(){
    const function_script1=`
       local operationset=cjson.decode(KEYS[1])
       local operationget=cjson.decode(KEYS[2])
       local ttl=KEYS[4]
       local model_name=KEYS[3]
       local operationdel=cjson.decode(KEYS[5])
       local res
       for i, name in ipairs(operationset) do
       redis.call("JSON.SET",model_name .. ":" .. name[1],"$",cjson.encode(name[2]))
       redis.call("EXPIRE",model_name .. ":" .. name[1],ttl)
       end
        local gets={ }
       for i, name in ipairs(operationget) do
        local path = "$"
        if name[2] ~=""  then
        path = "$." .. name[2]
        end
        local resp=redis.call("JSON.GET",model_name .. ":" .. name[1],path) 
        if(resp==nil or resp==false) then
        gets[i-1]={}
        else 
        gets[i-1]=cjson.decode(resp)
        end
       end
       for i, name in ipairs(operationdel) do
       redis.call("DEL",model_name .. ":" .. name) 
       end

       return cjson.encode(gets)

       `;
    const function_name1="setget";
    const function_script2=`
local functable={
  ["+"]= function(arr,obj,redisresi,i,eqntable) local test=tonumber(arr[i+1]) if(test==nil) then eqntable.eqn=(eqntable.eqn+redisresi[obj[arr[i+1]]]) else eqntable.eqn=(eqntable.eqn+test) end end,
   ["-"]= function(arr,obj,redisresi,i,eqntable) local test=tonumber(arr[i+1]) if(test==nil) then eqntable.eqn=(eqntable.eqn-redisresi[obj[arr[i+1]]]) else eqntable.eqn=eqntable.eqn-test end end,
  ["*"]= function(arr,obj,redisresi,i,eqntable) local test=tonumber(arr[i+1])if(test==nil) then eqntable.eqn=(eqntable.eqn*redisresi[obj[arr[i+1]]]) else eqntable.eqn=eqntable.eqn*test end end,
  ["/"]= function(arr,obj,redisresi,i,eqntable)local test=tonumber(arr[i+1]) if(test==nil) then eqntable.eqn=(eqntable.eqn/redisresi[obj[arr[i+1]]]) else eqntable.eqn=eqntable.eqn/test end end,
  ["&"]= function(arr,obj,redisresi,i,eqntable)local test=tonumber(arr[i+1]) if(test==nil) then eqntable.eqn=(eqntable.eqn .. redisresi[obj[arr[i+1]]]) else eqntable.eqn=eqntable.eqn .. test end end
}
local function numericalop(arr,obj,redisresi)
  local eqntable={eqn=""}
  local test=tonumber(arr[1])
  if(test==nil)then
    eqntable.eqn=redisresi[obj[arr[1]]]
  else
    eqntable.eqn=test
end
 for i=2 ,#arr,2 do
    functable[arr[i]](arr,obj,redisresi,i,eqntable)
 end
  return eqntable.eqn
  end

local equarray=cjson.decode(KEYS[3])
local locationobj=cjson.decode(KEYS[2])
local key=(KEYS[1])
local method=(KEYS[4])
local redisres= redis.call(unpack(cjson.decode(KEYS[5])))
for i=2,#redisres do
local enumur= numericalop(equarray,locationobj,redisres[i])
 local finalpathinput="$.".. key
     redis.call("JSON.SET",redisres[i][2],finalpathinput,cjson.encode(enumur ))
end
return "done"

`;
    const function_name2 = "aggregatorupdate";
    const function_name3="jsonmultkey";
    const function_script3=`
    local model_name=KEYS[1]
    local getkeys=cjson.decode(KEYS[2])
    local fields=cjson.decode(KEYS[3])
    local resp={};
    for i,name in ipairs(getkeys) do
    resp[#resp+1]=redis.call("JSON.GET",model_name..":" .. name,unpack(fields)) 
    
    end
    return resp;
    `;
    /**
     *it is used to get from json using get in bulk.
     * @param {string[][2]} functions -arr of key name.
     */
    function args(libname,...functions){
        let args=`#!lua name=${libname}`
        functions.forEach((item)=>{
            args+=`\n redis.register_function("${item[0]}",function(KEYS,ARGS) ${item[1]} end)`
        })
       return args;
    }

    try{
        const function_args=args("mylib2",[function_name1,function_script1],[function_name2,function_script2],[function_name3,function_script3]);
        await  this.client.call("FUNCTION","LOAD",function_args);
        // await this.client.call("FUNCTION","LOAD",`#!lua name=mylib2 \n redis.register_function("${function_name2}",function(KEYS,ARGS) ${function_script2} end) \n redis.register_function("${function_name1}",function(KEYS,ARGS) ${function_script1} end)`)


    }

    catch (e){
        if (e.message!="ERR Library 'mylib2' already exists"){
throw e;

        }
    }
    console.log("pinging redis"+":"+await this.client.ping());

}/**
     *it is used to get from json using get in bulk.`await jsongetmultkey().keys(...keys)` or ` normalize awaitjsongetmultkey().normalizekeys(...keys)` normalize it is additional postprocessor to convert null to undefined;
     * @param {string[]} fields -want to add in output. if not specified this will take *.
     * @param{string} model_name-name of model you want to fetch.
     *
     */
jsongetmultkey(model_name,...fields){
       let redis_ref=this.client;
       if (fields==undefined){
           return {keys:async function (...keys){
                   let res=await redis_ref.call("FCALL","jsonmultkey",3,model_name,JSON.stringify(keys),JSON.stringify(" "));
                   let res_processed=res.map((item)=>item===null?undefined:JSON.parse(item));
                   return res_processed;
               }
           }
       }
        return {keys:async function (...keys){
                let res=await redis_ref.call("FCALL","jsonmultkey",3,model_name,JSON.stringify(keys),JSON.stringify(fields));
                let res_processed=res.map((item)=>item===null?undefined:JSON.parse(item));
                return res_processed;
        }
        }

}
    /**
     * Stores a user object with a given key and optional TTL.
     * @param {string} key - Used as the identifier for the object. For example, in `user1 = { name: "name" }`, "user1" is the key.
     * @param {Object} jsonobj - The JSON object to store. Example: `{ name: "name" }`.
     * @param {string} model_name - Used for lookup (like a folder or MongoDB collection name).
     * @param {string} [ttl] - (Optional) Time-to-live in seconds. If unset, it defaults to 0.
     */
async jsonset(key,jsonobj,model_name,ttl){
        if (key ===undefined ||jsonobj===undefined||model_name===undefined){
            throw new Error("parameter in jsonset in not present");
        }
            await this.client.call("JSON.SET",model_name+":"+key,"$",JSON.stringify(jsonobj));
        if (ttl!==undefined){
            await this.client.expire(model_name+":"+key,ttl);
        }


}
    /**
     * return a object with a given key and for current model.
     * @param {string} key - Used as the identifier for the object. For example, in `user1 = { name: "name" }`, "user1" is the key.
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data ot same type.
     * @returns {object} The collection of stored user objects.
     */
async jsongetAll(key,model_name){
    if (key ===undefined ||model_name===undefined){
        throw new Error("parameter in jsongetAll in not present");
    }
        let jsonobj=await this.client.call("JSON.GET", model_name+":"+key,"$");
    try {
        return await JSON.parse(jsonobj)[0];
    }catch{
        return undefined;
    }

}
    /**
     * return an object with a given key and for current model.
     * @param {string} pathinput - use to get inside object for 'user={"name":"abhay","data":{"friends":[]}}' to get friends we need to use path 'data.friends'  .
     * @param {string} key - Used as the identifier for the object. For example, in `user1 = { name: "name" }`, "user1" is the key.
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data ot same type.
     * @returns {object} The collection of stored user objects.
     */
async jsonget(key,pathinput,model_name){
    if (key ===undefined ||pathinput===undefined||model_name===undefined){
        throw new Error("parameter in jsonget in not present");
    }
      let jsonobj=  await this.client.call("JSON.GET",model_name+":"+key,`$.${pathinput}`);
    try {
        return await JSON.parse(jsonobj)[0];
    }catch{
        return undefined;
    }
}
    /**
     * return a array of object with a given query and for current model.
     * @param {string} val - is query you asked for detail for queries call this function jsonqueryTextavailible  .
     * @param {callback} [preprocessor_optional] - it takes two parameters result,resultprocessed.sometimes output of redis is unformatted of a joke of array inside arrays notnobject so we need to process it ,generally our default preprocessor works but sometime you need to manually preprocess it ,it is very rare but it needs.
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data ot same type.
     * @returns {object} the array of  objects satisfy query.
     */
async jsonqueryText(val,model_name,preprocessor_optional){
    if (val===undefined||model_name===undefined){
        throw new Error("parameter in jsonqueryText in not present");
    }
       const result= await this.client.call("FT.SEARCH",model_name,val);
    let resultarr = [];
   if (preprocessor_optional) {
        preprocessor_optional(result,resultarr);
    }else{

       for (let i = 1; i < result.length - 1; i += 2) {
           resultarr.push([result[i], JSON.parse(result[i + 1][1])])
       }
   }
       return resultarr;

}
jsonqueryTextavailible(){
        return {
            "simpletext":"searchfor field where this is availble with property text",
            "*":"search for all availble document in current model/index",
            "simple phrase ":"(double inverted comman must)exact match",
            "texta |textb":"one of texta and textb is availble",
             "texta +textb":"both of texta and textb is availble",
            "@key:value":"key value pair",
            "%valuue%":"use for ignore typos",
            "@key:[lowerbound upperbound]":"use for range search for numeric values ",

        }
}
    /**
     * return a array of object with a given key:vslue matching and for current model.
     * @param {string} val - it is value of key .
     * @param {string} key - it is  key .
     * @param {callback} [preprocessor_optional] - it takes two parameters result,resultprocessed.sometimes output of redis is unformatted of a joke of array inside arrays notnobject so we need to process it ,generally our default preprocessor works but sometime you need to manually preprocess it ,it is very rare but it needs.
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data ot same type.
     * @returns {object} the array of  objects satisfy query.
     */
    async jsonquery(key ,val,model_name,preprocessor_optional){
        if (key===undefined||val===undefined||model_name===undefined){
            throw new Error("parameter in jsonquery in not present");
        }
        let result;
        if (Number.isInteger(val)){
            result= await this.client.call("FT.SEARCH",model_name,`@${key}:[${val} ${val}]`);
        }else{
            result= await this.client.call("FT.SEARCH",model_name,`@${key}:${val}`);
        }

        let resultarr=[];

        if (preprocessor_optional) {
            preprocessor_optional(result,resultarr);
        }else{

            for (let i = 1; i < result.length - 1; i += 2) {
                resultarr.push([result[i], JSON.parse(result[i + 1][1])])
            }
        }
        return resultarr;

    }
    /**
     * it create schema so key val pairs inside json is findable add only those keys that you need to retrieve again. once set impossible to edit without flushdb command. you need to go to redis-cli to perform this task i do not add as it is dangerous as a function.
     * @param {Object[]} key_tag_arr - `[ {key_name:value,tag_type:value, arr_type:value()},{...}]`,same as tag type only use when array tag is used,sortable optional `examples/example.js`.
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data of same type.
     * @returns {void} the array of  objects satisfy query.
     */
async jsonSchemaIdx(model_name,key_tag_arr){
//    [ {key_name:value,
//         tag_type:value,
//              arr_type:value();same as tag type only use when array tag is used
//     sortable:true/false optional
//    }
//     ]
//     availble tags=["TEXT","NUMERIC,"ARRAY","TAG",EXtras]
    let indexes=await this.client.call("FT._LIST");
    const exists = indexes.includes(model_name);
    if (exists){
        console.log("schema already exists",model_name);
        return
    }
    let create=[model_name,"ON","JSON","PREFIX",1,model_name+":","SCHEMA"]
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
            }

        else{
            create.push(`$.${pair.key_name}`,"AS",pair.key_name,pair.tag_type);
        if (pair.sortable!==undefined || pair.sortable){
            create.push("SORTABLE");
        }}  `4`
    }
    );
    this.client.call("FT.CREATE",...create);
}
    /**
     * it is special method chaining function which can be used to set multiple value in json and fetch multiple in one transaction as it use atomicity of redis.it done in one redis call instead multiple calls ,it returns an array filled of jsonget.     * @param {string} val - is query you asked for detail for queries call this function jsonqueryTextavailible  .
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data ot same type.one where method instantize only for one model in each call it create aa new instance of a private claass it exec command after exec();see example for detailafter call it reset where to add new jsonset and jsonget.
     * @param {number} [ttl] - used to add cache time for one transaction  unset used default else you can chane it later using ttlm method
     * @returns {object} the array of  objects satisfy query.
     * it has two method chaining functions jsonset and jsonget they all execute in one call. it is fast too much.its example you can find in examples.exec() must be at the end.this is also easier to use then general situation.
     */
 where(model_name,ttl){
        if(ttl===undefined){
            return new this.#queryconstructor(this.client,model_name,1200000000000);
        }else{
     return new this.#queryconstructor(this.client,model_name,ttl);}
}
    /**
     * it is special method chaining function which can be used for aggregation queries .
     *  it has many method you can use there is grouping and normal filter .for case of find/filter you can also give fields in exec to get only required fields(it is like project in mongoose if familiar with mongodb) or you can use update method to update or add field .
     * @param {string} model_name - model_name.it is like model in mongoose,or collection to organise,data ot same type.one where method instantize only for one model in each call it create aa new instance of a private claass it exec command after exec();see example for detailafter call it reset where to add new jsonset and jsonget.
     * @returns {object} the array of  objects satisfy query.
     */
whereagregater(model_name){
       return new this.#advancequeries(this.client,model_name);
}
#advancequeries=class{
  constructor(client,model_name){
      this.searcharr=["FT.AGGREGATE",model_name, "*" ];
      this.model_name=model_name;
      this.client=client;
      // this.limitarr=[];
      this.groupby=0;
  }
    /**
     * Find all the object whose values lies in given range for the given key.
     * @param {string} key - Used as the identifier for the key on which this function will be implemented.
     * @param {number} min - Minimum value of the range.
     * @param {number} max - Maximum value of the range.
     */
  jsonnumrange(key, min, max ){
    this.searcharr.push( "FILTER", "@"+key+`>='${min}' && @${key} <='${max}'`);
    return this;
  }
    /**
     * Find all the object for a given query.
     * @param {string} key -
     * @param {number} query - .
     */
  jsonfilter(key,query){
      this.searcharr.push(query);
      return this;
  }
    /**
     * Find and returns all the object which have value equals to given value of the given key .
     * @param {string} key - Name of the key whose value you want to compare. For example, in `user1 = { name: "abcd" }`, name is the key.
     * @param {number || string} value - Value or parameter with which values will be equated.
     */
  jsonequals(key,value){
      this.searcharr.push("FILTER",`@${key}=='${value}'`);
      return this;
  }
    /**
     * Checks that the given key is present in objects.
     * @param {string} key - Name of they which you want to find.
     */
  jsonexists(key){
      this.searcharr.push("FILTER",`exists(@${key})`);
      return this;
  }
    /**
     * Find and returns all the object which have value greater than or equal to given value of the given key .
     * @param {string} key - Name of the key whose value you want to compare. For example, in `user1 = { age:20 }`, age is the key.
     * @param {number} value - Value or parameter with which values will be compared.
     */
  jsongte(key, value){
      this.searcharr.push("FILTER", `@${key} >= '${value}'`);
      return this;
  }
    /**
     * Find and returns all the object which have value less than or equal to given value of the given key .
     * @param {string} key - Name of the key whose value you want to compare. For example, in `user1 = { age:20 }`, age is the key.
     * @param {number || string} value - Value or parameter with which values will be compared.
     */
  jsonlte(key, value){
      this.searcharr.push("FILTER", `@${key} <= '${value}'`);
      return this;
  }
    /**
     * Find and returns all the object which have value greater than given value of the given key .
     * @param {string} key - Name of the key whose value you want to compare. For example, in `user1 = { age:20 }`, age is the key.
     * @param {number || string} value - Value or parameter with which values will be compared.
     */
  jsongt(key, value){
      this.searcharr.push("FILTER", `@${key} > '${value}'`);
      return this;
  }
    /**
     * Find and returns all the object which have value less than given value of the given key .
     * @param {string} key - Name of the key whose value you want to compare. For example, in `user1 = { age:20 }`, age is the key.
     * @param {number || string} value - Value or parameter with which values will be compared.
     */
  jsonlt(key, value){
      this.searcharr.push("FILTER", `@${key} < '${value}'`);
      return this;
  }
    /**
     * Find and returns specific number of objects from a collection after skipping required number of objects.
     * For example, you want to skip starting 5 objects from the collection and want to return 10 objects.
     * @param {number} offset - Number of objects you want skip from starting.
     * @param {number} number - Number of objects you want to return after skipping.
     */
  jsonskiplimit(offset,number){

      this.searcharr.push("LIMIT",offset,number);
      return this;
  }
    /**
     * As the name suggests this function sort the objects according to the given key and given order.
     * @param {string} key - Name of the required key as basis for sorting.
     * @param {number || string} order - Order in which you want to sort the objects in a collection. `-1 ` and `DESC` are used for sorting in descending order and `ASC` and value other than `-1` used for sorting in ascending.
     */
jsonsort(key,order){
      if(order==-1 || order=="DESC"){
          order="DESC";
      }else{
          order="ASC";
      }
      this.searcharr.push("SORTBY", 2,"@"+key,  order);
      return this;
}
    /**
     * it is used to grouping and use `jsonaccumulator` to create fields .
     * @param {string} key -use to describe group by which element.
     */
jsongroup(key){
      this.searcharr.push("GROUPBY", "1", "@"+key);
      this.groupby=1;
      return this;
}
    /**
     * it is used only after grouping to create fields use multiple time to create more fields you have four ways to create fields ["MAX","MIN","TOLIST","SUM"].
     * @param {string} key - it is used to give which key is use for grouping.
     * @param {string}  MAX_MIN_AVG_SUM_TOLIST - availble options-`["MAX","MIN","TOLIST","SUM"]` to create fields.
     */
jsonaccumulator(key, MAX_MIN_AVG_SUM_TOLIST){

    this.searcharr.push("REDUCE", MAX_MIN_AVG_SUM_TOLIST, 1, "@" + key, "AS", MAX_MIN_AVG_SUM_TOLIST + "_" + key);

      return this;

}
/**
* it must be used at end of whereaggregator to execute.`whereaggregator will reset after use`.not chained after exec it should be used after it or initialize new whereaggregator.
* @param {...string} [keys] -(optional)which keys you want to see in output.if no input then it will be take all keys.`must not use after grouping`.
*/

 async exec(...keys){
      let parsemode=-1;
    if(keys==undefined || keys.length===0){
        if (this.groupby===0){
        parsemode=0;
        this.searcharr.push("LOAD", "*");

        }else{
            parsemode = 1;
        }

    }
    else{
        parsemode = 1;
        for(let i=0;i<keys.length;i++){
            keys[i]="@"+keys[i];
        }
        this.searcharr.push("LOAD", keys.length,keys)
    }
      let result =await this.client.call(...this.searcharr);
      this.searcharr=["FT.AGGREGATE",this.model_name];
      this.groupby=0;
      let resultparsed=[];
      const resultparserr={
          "0":()=>{
              for (let i=1;i<result.length;i++){
                  resultparsed.push(JSON.parse(result[i][result[i].length-1]));
              }
          },
          "1":()=>{
              for (let i=1;i<result.length;i++){
                  let objectpushed={}
                  for (let j=0;j<result[i].length;j+=2){

                      objectpushed[result[i][j]]=result[i][j+1];
                  }
                  resultparsed.push(objectpushed);
              }
          }
      }
      resultparserr[parsemode]();
      return (resultparsed);

  }



    /**
     *it is used for whereaggregator to update found values.(don't tense for performance it is atomic)
     * @param {string[]} arrofrequiredfieldforop - array of the fieds used in eqn for operation.
     * @param {string} pathinput - simple json path like data.friends for this exa=`{name:john doe,data:{friends:[]}}`
     * @param {string } method -currenly only "set" works{push will be added shortly}.
     @param {string} eqn -to construct equation you have five operators`[+,-,*,/,&]` here +,-,*,/ are arthimetic and & is for concatination .`note`:don't use brackets and those strings that are not part of schemakey(forget bodmass it process fromleft (some limitation for speed)) `exa`-`(2+age*6&first_name)==(((2+age)*6)&first_name)`.we will make less performant function for bodmass.
     */
    async update(pathinput,method,arrofrequiredfieldforop,eqn){
        function tokenizeExpression(expr) {

            const pattern = /([a-zA-Z_][a-zA-Z0-9_]*)|(\d*\.?\d+)|([+\-*&/])/g;
            const tokens = [...expr.matchAll(pattern)].map(match => match[0]);
            return tokens;
        }
        let tokenized=tokenizeExpression(eqn);
 if (this.groupby===1){
     throw new Error("after groupby update not possible");
 }
let locationobj={};
 for (let i=0;i<arrofrequiredfieldforop.length;i++){
     locationobj[arrofrequiredfieldforop[i]]=2*i+4;
 }

 this.searcharr.splice(3,0,"LOAD",1+arrofrequiredfieldforop.length,"__key",...arrofrequiredfieldforop);

        let resultres =await this.client.call("FCALL","aggregatorupdate",5,pathinput, JSON.stringify(locationobj),JSON.stringify(tokenized),method,JSON.stringify(this.searcharr));
        return resultres;
  }
}


   #queryconstructor= class{
    constructor(client ,model_name,ttl){
        if (client ===undefined ||model_name===undefined){
            throw new Error("parameter in where constructor in not present");
        }
        this.operationget=[];
        this.operationset=[];
        this.operationdel=[];
        this.client=client;
        this.model_name=model_name;
        this.ttl = ttl;



    }
       /**
        *it is used for where.
        * @param {number} ttl -to change ttl for current query.
        */
    jsonttl(ttl){
        this.ttl=ttl;
        return this;
    }
       /**
        *it is used to get from json using get.
        * @param {... string} key -the key which is used to set`(root key)`.you want to delete.
        */
       jsondelkey(...key){
           this.operationdel.push(...key);
           return this;
       }
       /**
        *it is used to get from json using get.
        * @param {string} key -the key which is used to set`(root key)`.
       * @param {string} pathinput -innerpath to get ,example `user1={name:someone,detail:{friends:[f1,f2,f3]}}` here user 1 is key and pathinput for friends is `detail.friends` .
        */
    jsonget(key,pathinput){
        this.operationget.push([key,pathinput]);
        return this;
    }
       /**
        *it is used to get from json using get in bulk.
        * @param {string[]} arr -arr of key name.
        */
    jsongetmultikey(...keys){
        keys.forEach(item=>{
            this.jsonget(item,"");
        })
        return this;
    }
       /**
        *it is used to get from json using get in bulk.
        * @param {string[]} arr -each item of this array contain two values `[[key,pathinput],[],..]`.
        */
    jsongetbulk(arr){
        arr.forEach(item=>{
            this.jsonget(item[0],item[1]);
        })
           return this;
    }
       /**
        *it is used to set from json using get in bulk.
        * @param {string[]} arr -each item of this array contain two values `[[key,jsonobj],[],..]`.
        */
    jsonsetbulk(arr){
        arr.forEach(item=>{
            this.jsonset(item[0],item[1]);
        })
        return this;
    }
       /**
        *it is used to set value jsonobj in json.
        * @param {string} key -the key which is used to set`(root key)`.
        * @param {string} jsonobj - `{name:someone,detail:{friends:[f1,f2,f3]}}` ,it must be in json`(not stringified)`.
        */
    jsonset(key,jsonobj){
        this.operationset.push([key, jsonobj]);
        return this;
    }
    #jsonarrparser(result){
        let finalarr=[];
        for (let i=0;result[i]!==undefined;i++){
            finalarr.push(result[i][0]);

        }
        return finalarr;
    }
       /**
        *it is used to execute where atomically.it return an array of output of all get requests and if something is not availible in db then its index is undefined.
       */
    async exec(){

       let function_name="setget";
const result=JSON.parse(await this.client.call("FCALL",function_name,5,JSON.stringify(this.operationset),JSON.stringify(this.operationget),this.model_name,this.ttl,JSON.stringify(this.operationdel)));

        this.operationget=[];
        this.operationset=[];
        return this.#jsonarrparser(result);

    }
}
}



