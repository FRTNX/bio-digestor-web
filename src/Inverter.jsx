import { useEffect, useState } from 'react';
import { fetchSystemData } from './api/solar-api';

import config from './config/config.json';

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

import GaugeChart from 'react-gauge-chart';

const Inverter = (props) => {
  console.log('inverter props: ', props)
  const [inverterData, setInverterData] = useState({ time_series: [{ output: 0 }], output: 0, max_output: 1500 });

  useEffect(() => {
    const interval = setInterval(() => { update() }, config.simulation.updateInterval);

    if (!props.active) { clearInterval(interval) }

    return () => { clearInterval(interval) }
  }, [props.systemId, props.active]);

  const update = async () => {
    const { result } = await fetchSystemData(props.systemId, 'inverter');
    setInverterData(current => result)
  };

  return (
    <div>
      {
        inverterData && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{ paddingTop: 30, fontSize: 30, color: 'grey' }}>Inverter</p>
            <div style={{ width: '80%', display: 'inline-block' }}>
              <ResponsiveContainer width='100%' height={200}>
                <AreaChart data={inverterData['time_series']} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <Area
                    name='Inverter Output (Watts)'
                    type="monotone"
                    dataKey="output"
                    stroke="#82ca9d"
                    fill='#82ca9d'
                    fillOpacity={0.8}
                  />
                  <CartesianGrid stroke="grey" strokeDasharray="3 3" />
                  <XAxis />
                  <YAxis />
                  <Tooltip />
                  <Legend formatter={(value, entry, index) => <span style={{ color: 'grey' }}>{value}</span>} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '20%', display: 'inline-block', verticalAlign: 'top', paddingTop: 40 }}>
              <GaugeChart
                id='gc-1'
                nrOfLevels={30}
                percent={inverterData['output'] / inverterData['max_output']}
              />
              <p style={{ color: 'grey' }}>Inverter Load</p>
            </div>
          </div>
        )
      }
    </div>
  )
};

export default Inverter;
