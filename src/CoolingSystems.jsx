import { useEffect, useState } from 'react';
import { updateCoolingSystem, fetchSystemData } from './api/solar-api';

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

import Switch from 'react-switch';
import config from './config/config.json';


const CoolingSystems = (props) => {
  const [coolingSystems, setCoolingSystems] = useState([]);
  const [localCooling, setLocalCooling] = useState(true);
  const [serverCooling, setServerCooling] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => { updateCooling() }, config.simulation.updateInterval);

    if (!props.active) {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    }
  }, [props.systemId, props.active]);

  const updateCooling = async () => {
    const { result } = await fetchSystemData(props.systemId, 'cooling');
    const { cooling, data } = result;
    console.log('cooling response: ', data)
    setCoolingSystems(current => data);
    setServerCooling(cooling);
  };

  const toggleCooling = () => {
    if (localCooling) {
      setLocalCooling(false)
      updateCoolingSystem({ system_id: props.systemId, active: false })
    } else {
      setLocalCooling(true);
      updateCoolingSystem({ system_id: props.systemId, active: true })
    }
  };

  return (
    <div>
      {
        coolingSystems?.length > 0 && (
          <div style={{ width: '100%', textAlign: 'center', position: 'relative' }}>
            <p style={{ paddingTop: 30, fontSize: 30, color: 'grey', display: 'inline-block' }}>Cooling Systems</p>
            <label style={{ display: 'inline-block', position: 'absolute', top: 68, paddingLeft: 20 }}>
              <Switch
                onChange={() => toggleCooling()}
                checked={localCooling}
                checkedIcon={false}
                uncheckedIcon={false}
                disabled={localCooling !== serverCooling}
              />
            </label>
            <br />
            {
              coolingSystems.map((coolingSystem, index) => (
                <div style={{ width: '50%', display: 'inline-block' }}>
                  <ResponsiveContainer width='100%' height={200}>
                    <LineChart data={coolingSystem['time_series']} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                      <Line name='Cooling System Output (℃)' type="monotone" dataKey='output' stroke="#8884d8" />
                      <CartesianGrid stroke="grey" strokeDasharray="3 3" />
                      <XAxis />
                      <YAxis />
                      <Tooltip />
                      <Legend formatter={(value, entry, index) => <span style={{ color: 'grey' }}>{value}</span>} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
};

export default CoolingSystems;
