import init,{evaluate_json,append_chart_json,inspect_data_json,render_data_chart_json} from './pkg/proof_web.js';
await init();postMessage({ready:true});
onmessage=({data})=>{
 try {
  if(data.type==='data-inspect') postMessage({type:data.type,id:data.id,result:JSON.parse(inspect_data_json(data.content,data.format))});
  else if(data.type==='data-append') postMessage({type:data.type,id:data.id,result:JSON.parse(append_chart_json(data.source,data.markdown))});
  else if(data.type==='data-chart') postMessage({type:data.type,id:data.id,result:JSON.parse(render_data_chart_json(data.content,data.format,data.label,data.value,data.kind,data.width))});
  else postMessage({id:data.id,result:JSON.parse(evaluate_json(data.source))});
 } catch(error){postMessage({type:data.type,id:data.id,error:String(error)});}
};
