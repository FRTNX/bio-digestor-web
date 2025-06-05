import { useEffect, useState } from 'react';
import { fetchSystemData } from './api/solar-api';

import { MenuIcon } from './assets/icons';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import {
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import BatteryGauge from 'react-battery-gauge';
import BatteryModal from './BatteryModal';

import config from './config/config.json';


const Batteries = (props) => {
  const [batteries, setBatteries] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => { update() }, config.simulation.updateInterval);
    if (!props.active) { clearInterval(interval) }

    return () => { clearInterval(interval) }
  }, [props.systemId, props.active]);

  const update = async () => {
    const { result } = await fetchSystemData(props.systemId, 'batteries');
    setBatteries(current => result)
  };

  const removeBattery = (batteryId) => { removePVBattery(systemId, batteryId) };

  return (
    <div>
      <div style={{ width: '100%', backgroundColor: '#1a1a1a' }}>
        <p style={{ width: '50%', display: 'inline-block' }}>Battery Array</p>
      </div>

      <div>
        {
          batteries.map((battery, index) => (
            <div key={index}>
              <div style={{ width: '100%', height: 60, backgroundColor: '#1a1a1a', position: 'relative' }}>
                <p style={{ display: 'inline-block' }}>{'Battery '}{index + 1}</p>
                <p style={{ display: 'inline-block', paddingLeft: 20 }}>{battery.capacity} V</p>
                <p style={{ display: 'inline-block', paddingLeft: 20 }}>{battery.amps} Ah</p>
                <p style={{ display: 'inline-block', paddingLeft: 20, marginBottom: 10 }}>
                  <BatteryGauge style={{ display: 'inline-block', position: 'absolute', top: 14 }} value={battery['soc'] * 100} size={50} />
                  <div style={{ display: 'inline-block', position: 'absolute', right: '5px', top: '11px' }}>
                    <Menu
                      menuButton={<MenuButton><MenuIcon /></MenuButton>}
                      menuStyle={{ backgroundColor: '#323030', color: 'white' }}
                      key={`solar-panel-menu-${index}`}
                      direction={'left'}
                      transition
                    >
                      <MenuItem onClick={() => removeBattery(battery['battery_id'])}>Remove Battery</MenuItem>
                      <MenuItem>Battery Details</MenuItem>
                    </Menu>
                  </div>
                </p>
              </div>
              {
                battery['time_series'] && (
                  <div style={{ width: '100%' }}>
                    <ResponsiveContainer width='100%' height={200}>
                      <LineChart data={battery['time_series']} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <Line name='Available Battery Power' type="monotone" dataKey='available_power' stroke="#8884d8" />
                        <CartesianGrid stroke="grey" strokeDasharray="3 3" />
                        <XAxis />
                        <YAxis />
                        <Tooltip />
                        <Legend formatter={(value, entry, index) => <span style={{ color: 'grey' }}>{value}</span>} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              }
            </div>
          ))
        }
      </div>
      <BatteryModal systemId={props.systemId} />
    </div>
  )
};

export default Batteries;
