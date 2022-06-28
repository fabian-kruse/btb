class Bayes {
	//idea: posterior = likelihood* prior/evidence
	//-> can be used to calculate prbabilities of concepts conditioned on a sample
	constructor(collection) {
		this.collection = collection;
		this.prior = []; //P(concept)
		this.likelihood = []; //P(sample | concept)
		this.posterior = []; //P(concept | sample)
		this.collection_size = collection.length;
		this.setPrior();
		//inits for likelihood
		for (let i = 0; i < this.collection_size; i++) {
			this.likelihood.push(1);
		}
	}

	//input: current turn as int, sample as list
	//returns: action of the computer
	getAction(turn, sample) {
		this.updateProbabilities(sample);
		setTimeout(getRandomInt(1000, 10000));
		if (turn == 5) {
			return 'guess:' + this.collection[this.bestGuess()];
		} else {
			let certainty = this.posterior[this.bestGuess()];
			if (certainty > 0.85) {
				return 'guess:' + this.collection[this.bestGuess()];
			} else {
				return 'pass';
			}
		}
	}

	//helper class for updates
	updateProbabilities(sample) {
		this.updateLikelihood(sample);
		this.updatePosterior(sample);
	}

	//uniform prior
	setPrior() {
		for (let i = 0; i < this.collection_size; i++) {
			this.prior.push(1 / this.collection_size);
		}
	}
	//updates the likelihood according to sample
	updateLikelihood(sample) {
		for (let i = 0; i < this.collection_size; i++) {
			this.likelihood[i] = this.likelihoodFunction(sample, this.collection[i]);
		}
	}

	//returns P(sample | concept) = (1/|concept|)^(|sample|)
	//-> likelihood
	likelihoodFunction(sample, concept) {
		return Math.pow(1 / concept.length, sample.length);
	}

	//updates posterior according to sample
	updatePosterior(sample) {
		let evidence = 0;
		for (let i = 0; i < this.collection_size; i++) {
			evidence =
				evidence +
				this.prior[i] *
					this.setIndicatorFunction(sample, this.collection[i]) *
					this.likelihoodFunction(sample, this.collection[i]);
		}
		for (let i = 0; i < this.collection_size; i++) {
			this.posterior[i] =
				(this.prior[i] *
					this.setIndicatorFunction(sample, this.collection[i]) *
					this.likelihoodFunction(sample, this.collection[i])) /
				evidence;
		}
	}

	//returns current best guess
	bestGuess() {
		const max = Math.max(...this.posterior);
		return this.posterior.indexOf(max);
	}

	//returns 1 if subset is a subset of set, else returns 0
	setIndicatorFunction(subset, set) {
		for (let i = 0; i < subset.length; i++) {
			if (!set.includes(subset[i])) {
				return 0;
			}
		}
		return 1;
	}
}
