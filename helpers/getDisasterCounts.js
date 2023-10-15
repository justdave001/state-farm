/* eslint-disable no-undef */

const getDisasterCounts = (sfcc2023Disasters) => {
	const state_disaster_counts = {};
	sfcc2023Disasters.forEach((disaster) => {
		if (!state_disaster_counts[disaster.state]) {
			state_disaster_counts[disaster.state] = 0;
		}
		state_disaster_counts[disaster.state]++;
	});

	return state_disaster_counts;
};

module.exports = getDisasterCounts;
