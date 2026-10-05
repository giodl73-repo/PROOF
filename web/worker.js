import init,{evaluate_json} from './pkg/proof_web.js';
await init();postMessage({ready:true});
onmessage=({data})=>{try{postMessage({id:data.id,result:JSON.parse(evaluate_json(data.source))});}catch(error){postMessage({id:data.id,error:String(error)});}};
