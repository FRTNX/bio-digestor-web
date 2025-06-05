import { useEffect, useState } from 'react';
import { fetchSystemData } from './api/solar-api';

import {
  AreaChart,
  Area,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import config from './config/config.json';


const SolarArrayOutput = (props) => {
  const [systemData, setSystemData] = useState([
    { solar_array_output: 0, time: '0' },
    { solar_array_output: 0, time: '0' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => { update() }, config.simulation.updateInterval);

    if (!props.active) { clearInterval(interval) }

    return () => { clearInterval(interval) }
  }, [props.systemId, props.active]);

  const update = async () => {
    const { result } = await fetchSystemData(props.systemId, 'system');
    setSystemData(current => result);
  };

  return (
    <div>
      <ResponsiveContainer width='100%' height={200}>
        <AreaChart data={systemData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
          <Area
            name='Total Solar Array Output (Watts)'
            label={'Solar Array Output'}
            type="monotone"
            dataKey="solar_array_output"
            stroke="#FFD700"
            fill='#FFD700'
            fillOpacity={0.65}
          />
          <CartesianGrid stroke="grey" strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend formatter={(value, entry, index) => <span style={{ color: 'grey' }}>{value}</span>} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
};

export default SolarArrayOutput;
