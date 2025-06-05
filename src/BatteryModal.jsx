import { useState, useEffect } from 'react'
import { addPVBattery } from './api/solar-api';
import Modal from 'react-modal';


Modal.setAppElement('#root')

const BatteryModal = (props) => {
  const [systemId, setSystemId] = useState(props.systemId);
  const [processing, setProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ volts: 12, amps: 100 });

  useEffect(() => { setSystemId(props.systemId) }, [props.systemId]);

  const handleChange = (event, target) => {
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
    addPVBattery({ system_id: systemId, volts: data.volts, amps: data.amps });
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
        Add New Battery
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
              height: 320,
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
          <h2>Add Battery</h2>
          <form >
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='inverter-input-volts' style={{ position: 'absolute', left: 20 }}>Volts:</label><br />
              <input
                type='number'
                id='inverter-input-volts'
                style={{ width: '100%', height: 35 }}
                value={data.volts}
                onChange={(event) => handleChange(event, 'volts')}
              />
            </div>
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='inverter-max-output' style={{ position: 'absolute', left: 20 }}>Amperes (Ah):</label><br />
              <input
                type='number'
                id='inverter-max-output'
                style={{ width: '100%', height: 35 }}
                value={data.amps}
                onChange={(event) => handleChange(event, 'amps')}
              />
            </div>
            <div style={{ paddingTop: 40 }}>
              <button
                onClick={closeModal}
                style={{ position: 'absolute', right: 165, backgroundColor: 'red', borderRadius: 5 }}
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
                Add Battery
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default BatteryModal;