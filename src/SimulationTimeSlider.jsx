import { useEffect, useState } from 'react';
import { updateSystemIterations, fetchSystemData } from './api/solar-api';

import ReactSlider from 'react-slider';
import styled from 'styled-components';

import config from './config/config.json';

const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 10px;
`;

const StyledThumb = styled.div`
    height: 30px;
    line-height: 30px;
    width: 30px;
    top: -10px;
    text-align: center;
    background-color: grey;
    color: #fff;
    border-radius: 50%;
    border: none;
    cursor: grab;
`;

const Thumb = (props, state) => <StyledThumb {...props}>{state.valueNow}</StyledThumb>;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background: ${props => (props.index === 2 ? '#f00' : props.index === 1 ? '#ddd' : '#0f0')};
    border-radius: 999px;
`;

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;

const SimulationTimeSlider = (props) => {
  const [iterations, setIterations] = useState(252);
  const [minIterations, setMinIterations] = useState(1);
  const [updatingIter, setUpdatingIter] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => { update() }, config.simulation.updateInterval);

    if (!props.active) { clearInterval(interval) }

    return () => { clearInterval(interval) }
  }, [props.systemId, props.active]);

  const update = async () => {
    const { result } = await fetchSystemData(props.systemId, 'iter');
    const { min, max } = result;
    setMinIterations(current => min);
    setIterations(current => max);
  };

  const updateIterations = async (value) => {
    setUpdatingIter(true);
    await updateSystemIterations({
      system_id: systemId,
      value
    });
    setUpdatingIter(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <StyledSlider
        min={Number(minIterations / 54).toFixed(0)}
        max={20}
        defaultValue={[3]}
        renderTrack={Track} renderThumb={Thumb}
        onAfterChange={(value) => updateIterations(value)}
        disabled={updatingIter}
      />
      <p style={{ paddingTop: 5, color: 'grey' }}>{`Simulation Duration (${Number(iterations / 54).toFixed(0)} Days)`}</p>
    </div>
  )
};

export default SimulationTimeSlider;
