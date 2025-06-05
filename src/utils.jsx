// deprecated
const acknowledgeMetadata = async (data) => {
  const system = data['time_series'];
  const systemIndex = system[system.length - 1]['index'];
  const inverter = data['inverter']['time_series'];
  const inverterIndex = inverter[inverter.length - 1]['index'];
  const panelIndices = data['panels'].reduce((result, panel) => ({
    ...result,
    [panel['panel_id']]: panel['time_series'][panel['time_series'].length - 1]['index']
  }), {});
  const batteryIndices = data['batteries'].reduce((result, battery) => ({
    ...result,
    [battery['battery_id']]: battery['time_series'][battery['time_series'].length - 1]['index']
  }), {});
  const coolingIndices = data['cooling_systems'].reduce((result, cooling) => ({
    ...result,
    [cooling['panel_id']]: cooling['time_series'][cooling['time_series'].length - 1]['index']
  }), {});

  const metadata = {
    system_id: systemId,
    system: systemIndex,
    inverter: inverterIndex,
    panels: panelIndices,
    batteries: batteryIndices,
    cooling_systems: coolingIndices
  };

  await updateMetadata(metadata);
};
