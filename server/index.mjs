import {createApp} from './app.mjs';
const app=await createApp();
const port=Number(process.env.PORT||3000);
app.server.listen(port,()=>console.log(`ЛЕС: сервер запущен на порту ${port}`));
const timer=setInterval(()=>void app.tick(),15000);timer.unref();
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{clearInterval(timer);app.server.close(()=>process.exit(0));});
