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

import SolarPanelModal from './PanelModal';

import config from './config/config.json';


const SolarPanels = (props) => {
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => { update() }, config.simulation.updateInterval);

    if (!props.active) { clearInterval(interval) }

    return () => { clearInterval(interval) }
  }, [props.systemId, props.active]);

  const update = async () => {
    const { result } = await fetchSystemData(props.systemId, 'panels');
    setPanels(current => result)
  };

  const removePanel = (panelId) => { removePVPanel(systemId, panelId) }

  return (
    <div>
      <div style={{ width: '100%', backgroundColor: '#1a1a1a' }}>
        <p style={{ width: '50%', display: 'inline-block' }}>Solar Array</p>
      </div>
      <div>
        {
          panels.map((panel, index) => (
            <div key={index}>
              <div style={{ width: '100%', height: 60, backgroundColor: '#1a1a1a', position: 'relative' }}>
                <p style={{ display: 'inline-block' }}>{'Solar Panel '}{index + 1}</p>
                <p style={{ display: 'inline-block', paddingLeft: 20 }}>{panel.rating} W</p>
                <p style={{ display: 'inline-block', paddingLeft: 20 }}>{Number(panel['output']).toFixed(2)} W</p>
                <p style={{ display: 'inline-block', paddingLeft: 20 }}>{`${Number(panel['temperature']).toFixed(1)} ℃`}</p>
                <p style={{ display: 'inline-block', paddingLeft: 20 }}>{`${Number(panel['efficiency'] * 100).toFixed(1)} %`}</p>
                <div style={{ display: 'inline-block', position: 'absolute', right: '5px', top: '11px' }}>
                  <Menu
                    menuButton={<MenuButton><MenuIcon /></MenuButton>}
                    menuStyle={{ backgroundColor: '#323030', color: 'white' }}
                    key={`solar-panel-menu-${index}`}
                    direction={'left'}
                    transition
                  >
                    <MenuItem onClick={() => removePanel(panel['panel_id'])}>Remove Panel</MenuItem>
                    <MenuItem>Panel Details</MenuItem>
                  </Menu>
                </div>
              </div>
              {
                panel['time_series'] && (
                  <div style={{ width: '100%' }}>
                    <ResponsiveContainer width='100%' height={200}>
                      <LineChart data={panel['time_series']} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <Line name="Solar Panel Output (Watts)" type="monotone" dataKey="power_output" stroke="#8884d8" />
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
      <SolarPanelModal systemId={props.systemId} />
    </div>
  )
};

export default SolarPanels;
