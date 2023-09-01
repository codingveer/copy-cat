import React,{useEffect, useState} from 'react';
import CreateClipping from './create-clipping';
import Clipping from './clipping';
import { useClippings } from '../use-clipping';
import CopyFromClipboard from './copy-from-clipboard';
const { ipcRenderer, keyboardCopyPressed, writeToClipboard, readFromClipboard } = window.api;

const Application = () => {
  const { clippings, addClipping, removeClipping } = useClippings();
  const [activeTab, setActiveTab] = useState('clipboard');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  useEffect( () => {
    console.log("init");
    const handleShortcut = async(event: any, message: string) => {
      if(message.startsWith("data:image/")){
        console.log(message,'message')
        setImageDataUrl(message)
      }else{
        addClipping(message);  
      }
     
        
    }
    keyboardCopyPressed( handleShortcut);

    return () => {
        // Clean up the listener when the component is unmounted.
        ipcRenderer.removeListener('global-shortcut', handleShortcut);
    };
}, []);

  return (
    <main className="flex flex-col w-screen h-screen">
      <header
        className="flex items-center h-8 font-semibold text-white bg-primary-400"
        id="title-bar"
      >
        <h1 className="w-full text-center">Clipmaster</h1>
      </header>
      <CreateClipping onSubmit={addClipping} />
      {imageDataUrl && <section className="flex flex-col h-full gap-2 p-4 overflow-y-scroll">
        <img src={imageDataUrl} alt={imageDataUrl} />
      </section>}
      <section className="flex flex-col h-full gap-2 p-4 overflow-y-scroll">
        {clippings.map((clipping) => (
          <Clipping
            key={clipping.id}
            id={clipping.id}
            value={clipping.value}
            onRemove={removeClipping}
            onCopy={writeToClipboard}
          />
        ))}
      </section>
      <CopyFromClipboard
        onClick={async () => {
          const content = await readFromClipboard();
          addClipping(content);
        }}
      />
    </main>
  );
};

export default Application;
