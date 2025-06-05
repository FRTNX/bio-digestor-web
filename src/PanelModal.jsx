import { useState, useEffect } from 'react'
import { addPVPanel } from './api/solar-api';
import Modal from 'react-modal';


Modal.setAppElement('#root')

const SolarPanelModal = (props) => {
  const [systemId, setSystemId] = useState(props.systemId)
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [data, setData] = useState({
    powerRating: 100,
    efficiency: 23,
    optimalTemperature: 25,
    temperatureCoefficient: 2,
    area: 3
  });

  useEffect(() => {
    setSystemId(props.systemId);
  }, [props.systemId]);

  const handleChange = (event, target) => {
    console.log(`${target}: `, event.target.value)
    setData({ ...data, [target]: event.target.value })
  }

  function openModal() {
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  };

  const submit = (event) => {
    event.preventDefault();
    setProcessing(true);
    const params = {
      system_id: systemId,
      stc: {
        power_rating: data.powerRating,
        efficiency: data.efficiency / 100,
        temperature: { unit: 'Celcius', value: data.optimalTemperature }
      },
      temp_coefficient: data.temperatureCoefficient / 100,
      area: data.area
    };
    addPVPanel(params);
    setOpen(false);
    setProcessing(false)
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={{ backgroundColor: 'green', position: 'absolute', left: '5px', top: 20 }}
        onClick={openModal}
        disabled={open}
      >
        Add New Solar Panel
      </button>
      <div style={{ position: 'relative', display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center' }}>
        <Modal
          isOpen={open}
          onRequestClose={closeModal}
          style={{
            overlay: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              textAlign: 'center',

            },
            content: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500,
              height: 555,
              border: '10px solid grey',
              background: '#111111',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '15px',
              outline: 'none',
              padding: '20px'
            }
          }}
          contentLabel="Example Modal"
        >
          <h2>Add Solar Panel</h2>
          <form >
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='power-rating' style={{ position: 'absolute', left: 20 }}>Power Rating (Watts):</label><br />
              <input
                type='number'
                id='power-rating'
                style={{ width: '100%', height: 35 }}
                value={data.powerRating}
                onChange={(event) => handleChange(event, 'powerRating')}
              />
            </div>
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='panel-efficiency' style={{ position: 'absolute', left: 20 }}>Efficiency (%):</label><br />
              <input
                type='number'
                id='panel-efficiency'
                style={{ width: '100%', height: 35 }}
                value={data.efficiency}
                onChange={(event) => handleChange(event, 'efficiency')}
              />
            </div>
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='opt-temp' style={{ position: 'absolute', left: 20 }}>Optimal Temperature (℃):</label><br />
              <input
                type='number'
                id='opt-temp'
                style={{ width: '100%', height: 35 }}
                value={data.optimalTemperature}
                onChange={(event) => handleChange(event, 'optimalTemperature')}
              />
            </div>
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='temp-coefficient' style={{ position: 'absolute', left: 20 }}>Temperature Coefficient (%):</label><br />
              <input
                type='number'
                id='temp-coefficient'
                style={{ width: '100%', height: 35 }}
                value={data.temperatureCoefficient}
                onChange={(event) => handleChange(event, 'temperatureCoefficient')}
              />
            </div>
            <div style={{ paddingBottom: 60 }}>
              <label htmlFor='area' style={{ position: 'absolute', left: 20, top: 377 }}>
                <p>
                  {'Area ( '}
                  <math>
                    <msup>
                      <mi>m</mi>
                      <mn>2</mn>
                    </msup>
                  </math>
                  {')'}
                </p>
              </label><br />
              <input
                type='number'
                id='area'
                style={{ width: '100%', height: 35 }}
                value={data.area}
                onChange={(event) => handleChange(event, 'area')}
              />
            </div>
            <div style={{ paddingTop: 10 }}>
              <button
                onClick={closeModal}
                style={{ position: 'absolute', right: 150, backgroundColor: 'red', borderRadius: 5 }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type='submit'
                onClick={(event) => submit(event)}
                style={{ position: 'absolute', right: 15, backgroundColor: 'green', borderRadius: 5 }}
                disabled={processing}
              >
                Add Panel
              </button>
            </div>
          </form>
        </Modal>
      </div>

    </div>

  );
};

export default SolarPanelModal;