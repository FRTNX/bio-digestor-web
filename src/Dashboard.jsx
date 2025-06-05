import { useEffect, useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { fetchPVSystem } from './api/solar-api';
import config from './config/config.json';

const PATH_TRANSITION_DURATION = 1.5;

const Dashboard = (props) => {
  const [systemTime, setSystemTime] = useState('');
  const [temperature, setTemperature] = useState(0);

  const [solarIrradiance, setSolarIrradiance] = useState(0);
  const [solarArrayOutput, setSolarArrayOutput] = useState(0);
  const [maxSolarOutput, setMaxSolarOutput] = useState(1000);
  const [aggrSolarOutput, setAggrSolarOutput] = useState(0);

  const [statsLeft, setStatsLeft] = useState(140);

  useEffect(() => {
    const handleWindowResize = () => {
      if (window, innerWidth < 1400) {
        const diff = Math.abs(140 - (window.innerWidth / 10)) + 50;
        setStatsLeft(140 - diff)
      } else {
        setStatsLeft(140)
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { updateSystemDetails() }, config.simulation.updateInterval);

    if (!props.active) {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    }
  }, [props.systemId, props.active]);

  const updateSystemDetails = async () => {
    if (props.systemId && props.active) {
      const system = await fetchPVSystem({ system_id: props.systemId });
      // setBatteryArrayPower(system['result']['battery_array_soc'] * 100);
      setSolarArrayOutput(system['result']['total_solar_output']);
      setSystemTime(system['result']['datetime']);
      setTemperature(system['result']['temperature'])
      setSolarIrradiance(system['result']['solar_irradiance'])
      setMaxSolarOutput(system['result']['max_solar_output']);
      setAggrSolarOutput(system['result']['aggregated_solar_output']);
      props.setActive(system['result']['active']);
    }
  };

  const getTimeEmoji = (hour) => {
    if (hour < 6 || hour >= 18) {
      return '🌛'
    }

    if (hour >= 6 && hour < 18) {
      return '🌤'
    }
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', width: '50%', position: 'relative' }}>
        <p style={{ fontSize: 100 }}>{systemTime.slice(11, 16)} {getTimeEmoji(Number(systemTime.slice(11, 13)))}</p>
        <p style={{ position: 'absolute', top: 230, left: statsLeft }}>
          {`Total Photovoltaic Output: ${Number(aggrSolarOutput / 1000).toFixed(2)} kW`}
        </p>
      </div>
      <div style={{ display: 'inline-block', width: '50%' }}>
        <div style={{ height: 150, width: 150, display: 'inline-block', padding: 10 }}>
          <CircularProgressbarWithChildren
            value={solarArrayOutput}
            maxValue={maxSolarOutput}
            styles={buildStyles({
              textSize: '10px',
              strokeLinecap: 'butt',
              pathColor: 'yellow',
              trailColor: 'grey',
              textColor: 'white',
              pathTransitionDuration: PATH_TRANSITION_DURATION
            })}
          >
            <div>
              <p style={{ fontSize: 11 }}>Solar Array Output</p>
              <p>
                {`${Number(solarArrayOutput).toFixed(2)} W`}
              </p>
            </div>
          </CircularProgressbarWithChildren>
        </div>
        <div style={{ height: 150, width: 150, display: 'inline-block', padding: 10 }}>
          <CircularProgressbarWithChildren
            value={solarIrradiance}
            maxValue={1100}
            styles={buildStyles({
              textSize: '10px',
              strokeLinecap: 'butt',
              pathColor: 'yellow',
              trailColor: 'grey',
              textColor: 'white',
              pathTransitionDuration: PATH_TRANSITION_DURATION
            })}
          >
            <div>
              <p style={{ fontSize: 11 }}>Solar Iraddiance</p>
              <p>
                {`${Number(solarIrradiance).toFixed(2)} W/`}
                <math>
                  <msup>
                    <mi>m</mi>
                    <mn>2</mn>
                  </msup>
                </math>
              </p>
            </div>
          </CircularProgressbarWithChildren>
        </div>
        <div style={{ height: 150, width: 150, display: 'inline-block', padding: 10 }}>
          <CircularProgressbarWithChildren
            value={temperature}
            maxValue={40}
            styles={buildStyles({
              textSize: '10px',
              strokeLinecap: 'butt',
              pathColor: 'yellow',
              trailColor: 'grey',
              textColor: 'white',
              pathTransitionDuration: PATH_TRANSITION_DURATION
            })}
          >
            <div>
              <p style={{ fontSize: 11 }}>Temperature</p>
              <p>{`${Number(temperature).toFixed(1)} ℃`}<math></math></p>
            </div>
          </CircularProgressbarWithChildren>
        </div>
      </div>
    </div>
  )
};

export default Dashboard;
