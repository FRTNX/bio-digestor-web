import { useState, useEffect, useRef } from 'react';
import { runSimulation, ping } from './api/bio-digestor-api';

import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Legend
} from 'recharts';

import { Space, Card } from 'antd';

import { PiRadioButtonFill } from "react-icons/pi";

import { BiPause, BiPlay, BiStop } from 'react-icons/bi';

import './App.css';

import ReactSlider from 'react-slider';
import styled from 'styled-components';

const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 2px;
`;

const StyledThumb = styled.div`
    height: 15px;
    line-height: 15px;
    width: 15px;
    top: -6px;
    text-align: center;
    background-color: rgb(125, 131, 17);
    color: grey;
    border-radius: 50%;
    border: none;
    cursor: grab;
`;

const Thumb = (props, state) => <StyledThumb {...props}></StyledThumb>;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background: ${props => (props.index === 2 ? '#f00' : props.index === 1 ? 'grey' : 'yellow')};
    border-radius: 999px;
`;

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;


function App() {
  const consoleOutputRef = useRef(null);

  const mobile = window.innerWidth < 500;
  const activeComponent = 'rgb(229, 194, 37)';

  // settings
  const [duration, setDuration] = useState(60 * 60 * 12)
  const [updateInterval, setUpdateInterval] = useState(100);
  const [timeStep, setTimeStep] = useState(10)
  const [startingTemperature, setStartingTemperature] = useState(20)
  const [startingPH, setStartingPH] = useState(8.8)

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState({ value: 'Initialising', color: 'yellow' });

  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  // time series
  const [ph, setPH] = useState([]);
  const [temperature, setTemperature] = useState([])
  const [acidValve, setAcidValve] = useState([])
  const [baseValve, setBaseValve] = useState([])
  const [agitator, setAgitator] = useState([])
  const [pump, setPump] = useState([])

  const [sim, setSim] = useState([])
  const [logs, setLogs] = useState([
    'Preparing Simulation...'
  ]);

  const [data, setData] = useState({
    'time': '15:13',
    'elapsed_time': '0 d 0 h 0 m 0 s',
    'temperature': 49.5,
    'pH': 6.800000000000008,
    'pump': true,
    'acid_valve': false,
    'base_valve': false,
    'agitator': true
  });

  useEffect(() => {
    log('Initialising...')
    setStatus({ value: 'Initialising ' })
    connectToServer();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (index < sim.length && !paused && !stopped) {
        setStatus({ value: 'Active', color: 'green' })
        setTimeout(() => {
          setIndex((prevIndex) => prevIndex + 1);
          setData(sim[index]);

          setTemperature(current => [...current, { temperature: sim[index].temperature }])
          setPH(current => [...current, { pH: sim[index].pH }]);

          setAcidValve(current => [...current, { acid: sim[index].acid_valve ? 1 : 0 }]);
          setBaseValve(current => [...current, { base: sim[index].base_valve ? 1 : 0 }]);
          setPump(current => [...current, { pump: sim[index].pump ? 1 : 0 }]);
          setAgitator(current => [...current, { agitator: sim[index].agitator ? 1 : 0 }]);

          log(`got data: ${JSON.stringify(sim[index])}`)
        }, updateInterval);
      }

      else if (paused && !stopped) {
        clearInterval(intervalId);
        setStatus({ value: 'Paused', color: 'yellow' })
        log('Simulation paused.')
      }

      else if (stopped) {
        clearInterval(intervalId);
        setPaused(false);    // clean up
        setStatus({ value: 'Done', color: 'grey' })
        log('Simulation stopped.')
      }

      else {
        clearInterval(intervalId);
        if (status.value !== 'Initialising') {
          setStatus({ value: 'Done', color: 'grey' })
          log('Simulation complete.')
        }
      }
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [index, sim, paused, stopped]);

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

  const reset = () => {
    setData({
      'time': '15:13',
      'elapsed_time': '0 d 0 h 0 m 0 s',
      'temperature': startingTemperature,
      'pH': startingPH,
      'pump': false,
      'acid_valve': false,
      'base_valve': false,
      'agitator': false
    });
    setStatus({ value: 'Initialising', color: 'yellow' });
    setIndex(0);
    setTemperature([]);
    setPH([]);
    setAcidValve([]);
    setBaseValve([]);
    setPump([]);
    setAgitator([]);
  }

  const connectToServer = async () => {
    const result = await ping();
    if (result.message) {
      log('Connected to server.')
      log('Ready to begin simulation.')
    } else {
      log('Failed to connect to server.')
      log('Check your internet connection or reload page.')
    }
  }

  const startSimulation = async () => {
    if (paused) {
      setPaused(false)
      log('Simulation resumed.')
    }

    else {
      reset();
      setPaused(false);
      setStopped(false);
      const params = {
        time_step: timeStep,
        delta: duration,
        starting_temperature: startingTemperature,
        starting_pH: startingPH
      };
  
      const simulation = await runSimulation(params);
      console.log('env init result:', simulation)
      if (simulation.data) {
        setSim(simulation.data)
        log('Ignition 🚀.')
        log('Initilaising environment')
        log('Initilaising components.')
        log('Initilaising micro-controller.')
        log('Running simulation.')
      } else {
        log('Error running simulation.')
        setStatus({ value: 'Initialising', color: 'yellow' })
      }
    }
  };

  const pause = () => {
    setPaused(true)
  };

  const stop = () => {
    setStopped(true);
  }

  const log = (text) => {
    setLogs(current => [text, ...current])
  }

  const formatSeconds = (seconds) => {
    let output = '';
    const d = seconds / (24 * 3600);
    const h = seconds % (24 * 3600) / 3600;
    const m = (seconds % 3600) / 60
    const s = seconds % 60

    if (d >= 1) output += `${Number(d).toFixed(0)} d `;
    if (h >= 1) output += `${Number(h).toFixed(0)} h `;
    if (m >= 1) output += `${Number(m).toFixed(0)} m `;
    if (s >= 1) output += `${Number(s).toFixed(0)} s `;

    return output;
  }

  const MicroController = () => (
    <div className='micro-controller'>
      <div className='sim-stats'>
        <span style={{ paddingLeft: 5, fontFamily: 'monospace' }}>Status: <span style={{ background: status.color || 'yellow', color: 'black', padding: 3, borderRadius: 5 }}>{status.value}</span></span>
      </div>
      <div className='mc-stats'>
        <PiRadioButtonFill style={{ color: data?.pump ? activeComponent : '' }} /><span className='component-stat'>Heat Pump</span><br />
        <PiRadioButtonFill style={{ color: data?.acid_valve ? activeComponent : '' }} /><span className='component-stat'>Acid Valve</span><br />
        <PiRadioButtonFill style={{ color: data?.base_valve ? activeComponent : '' }} /><span className='component-stat'>Base Valve</span><br />
        <PiRadioButtonFill style={{ color: data?.agitator ? activeComponent : '' }} /><span className='component-stat'>Agitator</span>
      </div>
      <span style={{ paddingLeft: 5, fontFamily: 'monospace' }}>Logs:</span><br />
      <span style={{ paddingLeft: 5, fontFamily: 'monospace', fontSize: 10, color: 'grey' }}>* new logs appear on top (bubble-up algo)</span>
      <div className='sim-logs'>
        <div>
          {
            logs.map((log) => (
              <div style={{ lineHeight: 1.1 }}>
                {/* <span className='sim-log-entry'>{`> ${log}`}</span> */}
                <span className='sim-log-entry' style={{ color: 'grey' }}>{'> '}<span style={{ color: 'white' }}>{`${log}`}</span></span>
              </div>
            ))
          }
          {/* <div ref={consoleOutputRef} /> */}
        </div>
      </div>
      <div style={{ paddingLeft: 5, paddingTop: 5, fontFamily: 'monospace' }}>
        <span style={{ borderBottom: '1px solid white' }}>Info:</span><br />
        <span style={{ color: 'yellow', fontWeight: 'bold' }}>Kudzai Makotore</span><br />
        <span>Bio-Digestor Simulator</span>
      </div>
    </div>
  )

  const BioDigestor = () => (
    <div className="water-tank">
      <div className='bd-stats'>
        <span>pH: <span style={{ color: (data?.pH >= 6.8 && data?.pH < 7.2) ? 'green' : 'red' }}>{Number(data?.pH).toFixed(1)}</span></span>
        <br />
        <span>Temperature: <span style={{ color: (data.temperature >= 52 && data.temperature <= 58) ? 'green' : 'red' }}>{Number(data?.temperature).toFixed(1)} ℃</span></span>
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
  )

  return (
    <>
      <div className='sim-container'>
        <div className='ctrl'>
          <div>
            <span className='sim-time'>{data?.time}</span>
          </div>
          <div className='ctrl-area'>
            <Space.Compact >
              <button
                style={{
                  background: 'rgb(41, 141, 61, 0.5)',
                  borderRight: '1px solid rgb(41, 141, 61, 0.5)'
                }}
                onClick={startSimulation}
                disabled={status.value === 'active'}
              >
                <BiPlay className='ctrl-icon' />
                start
              </button>
              <button
                style={{ background: 'rgb(43, 44, 41)', }}
                onClick={pause}
                disabled={status.value !== 'Active'}
                >
                <BiPause className='ctrl-icon' />
                pause
              </button>
              <button
               style={{
                background: 'rgba(174, 26, 26, 0.5)',
                borderLeft: '1px solid rgba(174, 26, 26, 0.5)'
                }}
                onClick={stop}
                disabled={status.value !== 'Active' && status.value !== 'Paused'}
                >
                <BiStop className='ctrl-icon' />
                stop
              </button>
            </Space.Compact>
            <div style={{ paddingTop: 10 }}>
              <div className='elapsed-label'>
                <span>Elapsed Time</span>
              </div>
              <div className='elapsed-time'>
                <span>{data?.elapsed_time}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='sim-settings'>
          <span>Sim Duration:</span><span style={{ float: 'right' }}>{formatSeconds(duration)}</span><br />
          <div style={{ paddingTop: 10, paddingBottom: 30 }}>
            <StyledSlider
              min={60 * 60 * 2}
              max={60 * 60 * 24 * 10}
              defaultValue={[60 * 60 * 12]}
              renderTrack={Track} renderThumb={Thumb}
              onAfterChange={(value) => setDuration(value)}
              disabled={status.value === 'Active'}
            />
          </div>

          <span>Sim Update Interval:</span><span style={{ float: 'right' }}>{updateInterval} ms</span><br />
          <div style={{ paddingTop: 10, paddingBottom: 30 }}>
            <StyledSlider
              min={10}
              max={3000}
              defaultValue={[100]}
              renderTrack={Track} renderThumb={Thumb}
              onAfterChange={(value) => setUpdateInterval(value)}
              disabled={status.value === 'Active'}
            />
          </div>

          <span>Time Step:</span><span style={{ float: 'right' }}>{timeStep} minutes</span><br />
          <div style={{ paddingTop: 10, paddingBottom: 30 }}>
            <StyledSlider
              min={1}
              max={60}
              defaultValue={[5]}
              renderTrack={Track} renderThumb={Thumb}
              onAfterChange={(value) => setTimeStep(value)}
              disabled={status.value === 'Active'}
            />
          </div>
        </div>
        <div className='sim-settings-2'>
          <span>Starting Temperature:</span><span style={{ float: 'right' }}>{startingTemperature} ℃</span><br />
          <div style={{ paddingTop: 10, paddingBottom: 30 }}>
            <StyledSlider
              min={10}
              max={50}
              defaultValue={[startingTemperature]}
              renderTrack={Track} renderThumb={Thumb}
              onAfterChange={(value) => setStartingTemperature(value)}
              disabled={status.value === 'Active'}
            />
          </div>

          <span>Starting pH:</span><span style={{ float: 'right' }}>{startingPH}</span><br />
          <div style={{ paddingTop: 10, paddingBottom: 30 }}>
            <StyledSlider
              min={1}
              max={10}
              defaultValue={[8.8]}
              renderTrack={Track} renderThumb={Thumb}
              onAfterChange={(value) => setStartingPH(value)}
              disabled={status.value === 'Active'}
            />
          </div>
        </div>
        <div className='quick-stats'>
          <span style={{ color: (data?.temperature >= 52 && data.temperature <= 58) ? 'green' : 'red' }}>{Number(data?.temperature).toFixed(1)} ℃</span>
          <br />
          <span style={{ color: (data?.pH >= 6.8 && data?.pH < 7.2) ? 'green' : 'red' }}>{Number(data?.pH).toFixed(1)}</span>
        </div>
        {
          !mobile && (
            <div>
              <BioDigestor />
              <MicroController />
            </div>
          )
        }
        {
          mobile && (
            <div>
              <MicroController />
              <BioDigestor />
            </div>
          )
        }
      </div>
      <div className='components'>
        <div className='component-graph'>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={temperature} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="rgb(46, 44, 44)" />
              <Line type="monotone" dataKey="temperature" stroke="#6f5e08" fill='#6f5e08' yAxisId={1} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='component-graph' >
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={ph} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="rgb(46, 44, 44)" />
              <Line type="monotone" dataKey="pH" stroke="rgb(68, 105, 54)" fill='rgb(68, 105, 54)' yAxisId={0} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='component-graph'>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={acidValve} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="rgb(46, 44, 44)" />
              <Line type="monotone" dataKey="acid" stroke="rgb(242, 251, 120)" fill='rgb(251, 192, 120)' yAxisId={1} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='component-graph' >
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={baseValve} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="rgb(46, 44, 44)" />
              <Line type="monotone" dataKey="base" stroke="rgb(54, 105, 102)" fill='rgb(54, 105, 102)' yAxisId={0} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='component-graph'>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={pump} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="rgb(46, 44, 44)" />
              <Line type="monotone" dataKey="pump" stroke="rgb(144, 156, 214)" fill='rgb(144, 156, 214)' yAxisId={1} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='component-graph' >
          <ResponsiveContainer width='100%' height={200}>
            <LineChart width={mobile ? (window.innerWidth - 30) : 330} height={200} data={agitator} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="rgb(46, 44, 44)" />
              <Line type="monotone" dataKey="agitator" stroke="rgb(154, 163, 151)" fill='rgb(68, 105, 54)' yAxisId={0} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {
        status.value === 'Done' && (
          <div style={{ paddingTop: 50, paddingBottom: 50 }}>
            <Card
              style={{ background: 'rgb(0,0,0)', color: 'rgb(163, 163, 163)', border: 'none' }}
              title={<span style={{ color: 'rgb(163, 163, 163)' }}>Results</span>}
            >
              <ul>
                <li>{`Simulation ran for ${data.elapsed_time}.`}</li>
                <li>{`Getting the slurry to an optimum temperature of 55 ℃ took 22 minutes from a starting temperature of 20 ℃.`}</li>
                <li>{`Acid valve was activated once.`}</li>
                <li>{`Base valve was activated 11 times.`}</li>
                <li>{`Heat pump was activated 5 times.`}</li>
                <li>{`Agitator was activated 12 times.`}</li>
              </ul>
            </Card>
          </div>
        )
      }
    </>
  )
}

export default App
