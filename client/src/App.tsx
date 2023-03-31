import React from 'react';
import logo from './logo.svg';
import './App.css';
//
import Step1 from './components/Step1';
import Step2 from './components/Step2';

function App() {
  return (
    <div>
      <div className='text-2xl font-bold mt-4 ml-3'>Spring Boot App Generator</div>
      <div className="h-full min-h-[100vh] flex gap-[15px] flex-wrap sm:flex-nowrap">
        <Step1 />
        <Step2 />
      </div>
    </div>
  );
}

export default App;
