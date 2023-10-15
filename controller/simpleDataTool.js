/* eslint-disable no-undef */
const getDisasterCounts = require("../helpers/getDisasterCounts");

const sfcc2023Agents = require("../data/sfcc_2023_agents.json");
// eslint-disable-next-line no-unused-vars
const sfcc2023ClaimHandlers = require("../data/sfcc_2023_claim_handlers.json");
const sfcc2023Claims = require("../data/sfcc_2023_claims.json");
const sfcc2023Disasters = require("../data/sfcc_2023_disasters.json");

const disasterCounts = getDisasterCounts(sfcc2023Disasters);

class SimpleDataTool {
	constructor() {
		this.REGION_MAP = {
			west: "Alaska,Hawaii,Washington,Oregon,California,Montana,Idaho,Wyoming,Nevada,Utah,Colorado,Arizona,New Mexico",
			midwest:
        "North Dakota,South Dakota,Minnesota,Wisconsin,Michigan,Nebraska,Iowa,Illinois,Indiana,Ohio,Missouri,Kansas",
			south:
        "Oklahoma,Texas,Arkansas,Louisiana,Kentucky,Tennessee,Mississippi,Alabama,West Virginia,Virginia,North Carolina,South Carolina,Georgia,Florida",
			northeast:
        "Maryland,Delaware,District of Columbia,Pennsylvania,New York,New Jersey,Connecticut,Massachusetts,Vermont,New Hampshire,Rhode Island,Maine",
		};
	}

	/**
   * Calculates the number of claims where the status is "Closed"
   *
   * @returns {number} number of closed claims
   */
	getNumClosedClaims() {
		return sfcc2023Claims.filter((claim) => claim.status === "Closed").length;
	}

	/**
   * Calculates the number of claims assigned to a specific claim handler.
   *
   * @param {number} claimHandlerId - ID of the claim handler.
   * @returns {number} - Number of claims assigned to the claim handler.
   */
	getNumClaimsForClaimHandlerId(claimHandlerId) {
		return sfcc2023Claims.filter(
			(claim) => claim.claim_handler_assigned_id === claimHandlerId,
		).length;
	}

	/**
   * Calculates the number of disasters for a specific state.
   *
   * @param {string} state - Name of a state in the United States of America, including the District of Columbia.
   * @returns {number} - Number of disasters for the state.
   */
	getNumDisastersForState(state) {
		return sfcc2023Disasters.filter((disaster) => disaster.state === state)
			.length;
	}

	/**
   * Sums the estimated cost of a specific disaster by its claims.
   *
   * @param {number} disasterId - ID of disaster.
   * @returns {number|null} - Estimate cost of disaster, rounded to the nearest hundredths place,
   *                          or null if no claims are found.
   */
	getTotalClaimCostForDisaster(disasterId) {
		const related_claims = sfcc2023Claims.filter(
			(claim) => claim.disaster_id === disasterId,
		);

		if (related_claims.length == 0) {
			return null;
		}
		const total_cost = related_claims.reduce(
			(acc, claim) => acc + claim.estimate_cost,
			0,
		);

		return parseFloat(total_cost.toFixed(2));
	}

	/**
   * Gets the average estimated cost of all claims assigned to a claim handler.
   *
   * @param {number} claimHandlerId - ID of claim handler.
   * @returns {number|null} - Average cost of claims, rounded to the nearest hundredths place,
   *                          or null if no claims are found.
   */
	getAverageClaimCostForClaimHandler(claimHandlerId) {
		const handler_claims = sfcc2023Claims.filter(
			(claim) => claim.claim_handler_assigned_id === claimHandlerId,
		);

		if (handler_claims.length === 0) return null;

		const total_cost_for_handlers = handler_claims.reduce(
			(acc, claim) => acc + claim.estimate_cost,
			0,
		);
		return parseFloat(
			(total_cost_for_handlers / handler_claims.length).toFixed(2),
		);
	}

	/**
   * Returns the name of the state with the most disasters based on disaster data.
   * If two states have the same number of disasters, then sorts by alphabetical (a-z)
   * and takes the first.
   *
   * @returns {string} - Single name of state
   */
	getStateWithMostDisasters() {
		let max_disaster_counter = 0;
		let state_with_most_disasters = "";
		for (let state in disasterCounts) {
			if (disasterCounts[state] > max_disaster_counter) {
				max_disaster_counter = disasterCounts[state];
				state_with_most_disasters = state;
			} else if (
				disasterCounts[state] === max_disaster_counter &&
        state < state_with_most_disasters
			) {
				state_with_most_disasters = state;
			}
		}

		return state_with_most_disasters;
	}

	/**
   * Returns the name of the state with the least disasters based on disaster data.
   * If two states have the same number of disasters, then sorts by alphabetical (a-z)
   * and takes the first.
   *
   * Example: Say New Mexico and West Virginia both have the least number of disasters at
   *          1 disaster each. Then, this method would return "New Mexico" since "N"
   *          comes before "W" in the alphabet.
   *
   * @returns {string} - Single name of state
   */
	getStateWithLeastDisasters() {
		let min_disaster_counter = Infinity;
		let state_with_least_disasters = "";
		for (let state in disasterCounts) {
			if (disasterCounts[state] < min_disaster_counter) {
				min_disaster_counter = disasterCounts[state];
				state_with_least_disasters = state;
			} else if (
				disasterCounts[state] === min_disaster_counter &&
        state < state_with_least_disasters
			) {
				state_with_least_disasters = state;
			}
		}

		return state_with_least_disasters;
	}

	/**
   * Returns the name of the most spoken language by agents (besides English) for a specific state.
   *
   * @param {string} state - Name of state.
   * @returns {string} - Name of language, or empty string if state doesn't exist.
   */
	getMostSpokenAgentLanguageByState(state) {
		const language_frequency = {};

		let max_language_counter = 0;
		let most_spoken_language = "";

		const agents = sfcc2023Agents.filter((agent) => agent.state == state);

		if (agents.length == 0) return "";

		agents.forEach((agent) => {
			const spoken_language = agent.secondary_language;
			if (spoken_language && spoken_language != "English") {
				if (!language_frequency[spoken_language]) {
					language_frequency[spoken_language] = 0;
				}
				language_frequency[spoken_language]++;

				if (language_frequency[spoken_language] > max_language_counter) {
					max_language_counter = language_frequency[spoken_language];
					most_spoken_language = spoken_language;
				} else if (
					language_frequency[spoken_language] === max_language_counter &&
          spoken_language < most_spoken_language
				) {
					most_spoken_language = spoken_language;
				}
			}
		});

		return most_spoken_language;
	}

	/**
   * Returns the number of open claims for a specific agent and for a minimum severity level and higher.
   *
   * Note: Severity rating scale for claims is 1 to 10, inclusive.
   *
   * @param {number} agentId - ID of the agent.
   * @param {number} minSeverityRating - Minimum severity rating to consider.
   * @returns {number|null} - Number of claims that are not closed and have minimum severity rating or greater,
   *                          -1 if severity rating out of bounds,
   *                          null if agent does not exist, or agent has no claims (open or not).
   */
	getNumOfOpenClaimsForAgentAndSeverity(agentId, minSeverityRating) {
		if (minSeverityRating > 10 || minSeverityRating <= 0) return -1;

		const claims = sfcc2023Claims.filter(
			(claim) => claim.agent_assigned_id === agentId,
		);

		if (claims.length === 0) return null;

		const open_claims = claims.filter((claim) => claim.status !== "Closed");

		const open_claims_for_agent_and_severity = open_claims.reduce(
			(acc, claim) => {
				if (claim.severity_rating >= minSeverityRating) {
					return acc + 1;
				} else {
					return acc;
				}
			},
			0,
		);

		return open_claims_for_agent_and_severity;
	}

	/**
   * Gets the number of disasters where it was declared after it ended.
   *
   * @returns {number} - Number of disasters where the declared date is after the end date.
   */
	getNumDisastersDeclaredAfterEndDate() {
		const disasters_declared_after_end_date = sfcc2023Disasters.filter(
			(disaster) => {
				const end_date = new Date(disaster.end_date);
				const declared_date = new Date(disaster.declared_date);
				return declared_date > end_date;
			},
		);

		return disasters_declared_after_end_date.length;
	}

	/** Builds a map of agent and their total claim cost
   *
   * Hints:
   *     An agent with no claims should return 0
   *     Invalid agent id should have a value of Undefined
   *     You should round your totalClaimCost to the nearest hundredths
   *
   *  @returns {Object}: key is agent id, value is total cost of claims associated to the agent
   */
	buildMapOfAgentsToTotalClaimCost() {
		const agent_to_claim_cost = {};

		sfcc2023Agents.forEach((agent) => {
			const claims = sfcc2023Claims.filter(
				(claim) => claim.agent_assigned_id === agent.id,
			);

			const total_claim_cost = claims.reduce(
				(acc, claim) => acc + claim.estimate_cost,
				0,
			);

			agent_to_claim_cost[agent.id] = parseFloat(total_claim_cost.toFixed(2));
		});

		return agent_to_claim_cost;
	}

	/**  Calculates density of a disaster based on the number of claims and impact radius
     *
     * Hints:
     *     Assume uniform spacing between claims
     *     Assume disaster impact area is a circle
     *
     * @param {number} disasterId - ID of disaster.
     // eslint-disable-next-line max-len
     * @returns {number} density of claims to disaster area, rounded to the nearest thousandths place
     * null if disaster does not exist
     */
	calculateDisasterClaimDensity(disasterId) {
		const claims_from_disaster = sfcc2023Claims.filter(
			(claim) => claim.disaster_id === disasterId,
		);

		if (claims_from_disaster.length === 0) return null;

		const radius_of_disaster = sfcc2023Disasters.find(
			(disaster) => disaster.id === disasterId,
		)?.radius_miles;

		const disaster_claim_density =
      claims_from_disaster.length / (Math.PI * radius_of_disaster ** 2);
		return parseFloat(disaster_claim_density.toFixed(5));
	}

	/**
   * Gets the top three months with the highest total claim cost.
   *
   * Hint:
   *     Month should be full name like 01 is January and 12 is December.
   *     Year should be full four-digit year.
   *     List should be in descending order.
   *
   * @returns {Array} - An array of three strings of month and year, descending order of highest claims.
   */
	getTopThreeMonthsWithHighestNumOfClaimsDesc() {
		const month_claim_costs = {};

		sfcc2023Claims.forEach((claim) => {
			const disaster = sfcc2023Disasters.find(
				(d) => d.id === claim.disaster_id,
			);
			if (!disaster) return;

			const month = new Date(disaster.declared_date).getMonth() + 1;
			const month_name = new Date(2000, month - 1).toLocaleString("default", {
				month: "long",
			});
			const year = new Date(disaster.declared_date).getFullYear();
			const month_year = `${month_name} ${year}`;

			if (!month_claim_costs[month_year]) {
				month_claim_costs[month_year] = 0;
			}

			month_claim_costs[month_year] += claim.estimate_cost;
		});

		const sorted_months = Object.keys(month_claim_costs)
			.sort(
				(a, b) =>
					month_claim_costs[b] - month_claim_costs[a] || a.localeCompare(b),
			)
			.slice(0, 3);
		return sorted_months;
	}
}

// eslint-disable-next-line no-undef
module.exports = SimpleDataTool;
