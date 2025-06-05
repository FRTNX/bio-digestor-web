import { useState, useEffect, useRef } from 'react';
import { initEnv, tick } from './api/bio-digestor-api';

import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Legend
} from 'recharts';

import { PiRadioButtonFill } from "react-icons/pi";

import { BiPause, BiPlay, BiStop } from 'react-icons/bi';

import './App.css';

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const generateData = (params, variation = 10, rows = 10) => {
  const d = [];
  let minValue = 0;
  let maxValue = variation;
  for (let i = 0; i < rows; i++) {
    const datapoint = {};
    params.map((param) =>
      datapoint[param] = random(minValue, maxValue)
    )
    d.push(datapoint)
    minValue += 1;
    maxValue += 1;
  }
  return d;
};


function App() {
  const consoleOutputRef = useRef(null);

  const mobile = window.innerWidth < 500;
  const activeComponent = 'rgb(229, 194, 37)';

  const [status, setStatus] = useState({ value: 'Initialising', color: 'yellow' });

  // time series
  const [ph, setPH] = useState([]);
  const [temperature, setTemperature] = useState([])
  const [acidValve, setAcidValve] = useState([])
  const [baseValve, setBaseValve] = useState([])

  const [sim, setSim] = useState([])
  const [logs, setLogs] = useState([
    'Preparing Simulation...'
  ]);

  const [data, setData] = useState({
    'time': '15:13',
    'elapsed_time': '0 d 2 h 5 m 0 s',
    'temperature': 49.5,
    'pH': 6.800000000000008,
    'pump': true,
    'acid_valve': false,
    'base_valve': false,
    'agitator': true
  });

  useEffect(() => {
    log('Initialising...')
    setStatus({ value: 'Initialising '})
    fetchSim();
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = 50;
    const intervalId = setInterval(() => {
      if (index < sim.length) {
        setStatus({ value: 'Active', color: 'green' })
        setTimeout(() => {
          setIndex((prevIndex) => prevIndex + 1);
          setData(sim[index]);
          log(`got data: ${JSON.stringify(sim[index])}`)
        }, interval); // 2 seconds
      } else {
        clearInterval(intervalId);
        if (status.value !== 'Initialising') {
          // setStatus({ value: 'Done', color: 'grey' })
        }
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [index, sim]);

  useEffect(() => {
    if (logs.length > 0) {
      scrollToBottom();
    }
  }, [logs]);

  const scrollToBottom = async () => {
    await consoleOutputRef.current?.scrollIntoView({
      // behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  };

  const fetchSim = async () => {
    const simulation = await initEnv();
    console.log('env init result:', simulation)
    if (simulation) {
      setSim(simulation.data)
      log('Connected to server.')
      log('Created sim environment.')
    } else {
      log('Failed to connect to server')
      setStatus({ value: 'Initialising', color: 'yellow' })
    }
  }

  const log = (text) => {
    setLogs(current => [...current, text])
  }

  return (
    <>
      <div className='sim-container'>
        <div>
          <span className='sim-time'>{data?.time}</span>
        </div>
        <div className='ctrl-area'>
          <div className='ctrl-btn'>
            <button>
              <BiPlay className='ctrl-icon' />
              start
            </button>
          </div>
          <div className='ctrl-btn'>
            <button>
              <BiPause className='ctrl-icon' />
              pause
            </button>
          </div>   <div className='ctrl-btn'>
            <button>
              <BiStop className='ctrl-icon' />
              stop
            </button>
          </div>
          <div className='elapsed-time'>
            <span>{data?.elapsed_time}</span>
          </div>
          <div className='elapsed-label'>
            <span>Elapsed Time</span>
          </div>

        </div>
        <div className="water-tank">
          <div className='bd-stats'>
            <span>pH: <span style={{ color: (data?.pH >= 6.8 && data?.pH < 7.2) ? 'green' : 'red' }}>{Number(data?.pH).toFixed(1)}</span></span>
            <br />
            <span>Temperature: <span style={{ color: data?.temperature >= 55 ? 'green' : 'red' }}>{Number(data?.temperature).toFixed(1)} ℃</span></span>
          </div>

          <div className="liquid">
            <svg className="water" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0" style={{ stopColor: "rgb(87, 74, 22)" }} />
                  <stop offset="0.1643" style={{ stopColor: "rgba(189, 184, 23, 0.78)" }} />
                  <stop offset="0.3574" style={{ stopColor: "rgb(222, 222, 18)" }} />
                  <stop offset="0.5431" style={{ stopColor: "rgb(150, 146, 19)" }} />
                  <stop offset="7168" style={{ stopColor: "rgb(183, 159, 64)" }} />
                  <stop offset="0.874" style={{ stopColor: "rgb(160, 182, 51)" }} />
                  <stop offset="1" style={{ stopColor: "rgb(155, 188, 21)" }} />
                </linearGradient>
              </defs>
              <path fill="url(#waterGradient)" d="
        M 0,0 v 100 h 200 v -100 
        c -10,0 -15,5 -25,5 c -10,0 -15,-5 -25,-5
        c -10,0 -15,5 -25,5 c -10,0 -15,-5 -25,-5
        c -10,0 -15,5 -25,5 c -10,0 -15,-5 -25,-5
        c -10,0 -15,5 -25,5 c -10,0 -15,-5 -25,-5
        
      "/>
            </svg>
          </div>
          <div className="indicator" data-value="75"></div>
          <div className="indicator" data-value="50"></div>
          <div className="indicator" data-value="25"></div>
          {/* <div className="label">57%</div> */}
        </div>
        <div className='micro-controller'>
          <div className='sim-stats'>
            <span style={{ paddingLeft: 5, fontFamily: 'monospace' }}>Status: <span style={{ background: status.color, color: 'black', padding: 3, borderRadius: 5 }}>{status.value}</span></span>

          </div>
          <div className='mc-stats'>
            <PiRadioButtonFill style={{ color: data?.pump ? activeComponent : '' }} /><span className='component-stat'>Heat Pump</span><br />
            <PiRadioButtonFill style={{ color: data?.acid_valve ? activeComponent : '' }} /><span className='component-stat'>Acid Valve</span><br />
            <PiRadioButtonFill style={{ color: data?.base_valve ? activeComponent : '' }} /><span className='component-stat'>Base Valve</span><br />
            <PiRadioButtonFill style={{ color: data?.agitator ? activeComponent : '' }} /><span className='component-stat'>Agitator</span>
          </div>

          <span style={{ paddingLeft: 5, fontFamily: 'monospace' }}>Logs:</span>
          <div className='sim-logs'>
            <div>
              {
                logs.map((log) => (
                  <div style={{ lineHeight: 1.1 }}>
                    <span className='sim-log-entry'>{`> ${log}`}</span>
                  </div>
                ))
              }
              <div ref={consoleOutputRef} />
            </div>

          </div>
          <div style={{ paddingLeft: 5, paddingTop: 5, fontFamily: 'monospace' }}>
            <span style={{ borderBottom: '1px solid white' }}>Info:</span><br />
            <span style={{ color: 'yellow' }}>Kudzai Makatore</span><br />
            <span>Bio-Digestor Simulator</span>
          </div>
        </div>
      </div>
      <div className='components'>
        <div style={{ width: '50%', display: 'inline-block' }}>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={generateData(['name', 'pH',])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#f5f5f5" />
              <Line type="monotone" dataKey="pH" stroke="#fff" fill='#fff' yAxisId={0} />
              {/* <Line type="monotone" dataKey="pv" stroke="#6f5e08" fill='#6f5e08' yAxisId={1} /> */}
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '50%', display: 'inline-block' }}>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={generateData(['name', 'temperature'])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#f5f5f5" />
              {/* <Line type="monotone" dataKey="uv" stroke="#fff" fill='#fff' yAxisId={0} /> */}
              <Line type="monotone" dataKey="temperature" stroke="#6f5e08" fill='#6f5e08' yAxisId={1} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '50%', display: 'inline-block' }}>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={generateData(['name', 'pv', 'uv'])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#f5f5f5" />
              <Line type="monotone" dataKey="uv" stroke="#fff" fill='#fff' yAxisId={0} />
              <Line type="monotone" dataKey="pv" stroke="#6f5e08" fill='#6f5e08' yAxisId={1} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '50%', display: 'inline-block' }}>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={generateData(['name', 'pv', 'uv'])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#f5f5f5" />
              <Line type="monotone" dataKey="uv" stroke="#fff" fill='#fff' yAxisId={0} />
              <Line type="monotone" dataKey="pv" stroke="#6f5e08" fill='#6f5e08' yAxisId={1} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

export default App
