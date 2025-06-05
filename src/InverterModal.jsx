

const InverterModal = () => {
    return (
      <div style={{ position: 'relative', display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center' }}>
        <Modal
          isOpen={inverterModalOpen}
          onRequestClose={closeInverterModal}
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
              height: 333,
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
          <h2>Edit Inverter</h2>
          <form >
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='power-rating' style={{ position: 'absolute', left: 20 }}>Max Output (Watts):</label><br />
              <input
                type='number'
                id='temp-coefficient'
                style={{ width: '100%', height: 35 }}
                value={newPanel.temperatureCoefficient}
                onChange={(event) => handlPanelChange(event, 'temperatureCoefficient')}
              />
            </div>
            <div style={{ paddingBottom: 10 }}>
              <label htmlFor='power-rating' style={{ position: 'absolute', left: 20 }}>Input Voltage (Volts):</label><br />
              <input
                type='number'
                id='temp-coefficient'
                style={{ width: '100%', height: 35 }}
                value={newPanel.temperatureCoefficient}
                onChange={(event) => handlPanelChange(event, 'temperatureCoefficient')}
              />
            </div>
            <div style={{ paddingTop: 10 }}>
              <button
                onClick={closeInverterModal}
                style={{ position: 'absolute', right: 150, backgroundColor: 'red', borderRadius: 5 }}
              >
                Cancel
              </button>
              <button
                type='submit'
                style={{ position: 'absolute', right: 15, backgroundColor: 'green', borderRadius: 5 }}
              >
                Edit Inverter
              </button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }