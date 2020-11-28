#include <cmath>
#include <iostream>
#include <sstream>

#include "Network.hpp"

float Network::learningRate = 0.05;
const std::vector<std::size_t> Network::topology = { 5, 21, 21, 1 };

float Network::activation (float x) {
  return 1 / (1 + std::pow(std::expf(1), -x));
}

float Network::activationDerivative (float x) {
  return x * (1 - x);
}

void Network::train (Redis *redis, const std::vector<std::vector<float>> &input, const std::vector<float> &result) {
  std::optional<std::vector<Matrix>> weights;

  if (redis->exists("cashup_data")) {
    weights = Network::unserialize(*redis->get("cashup_data"));
  }

  Network net(weights);
  float mapeHighest = 0;
  float mapeAverage = 0;
  float mapeLowest = 100;

  for (std::size_t i = 0, size = input.size(); i < size; i++) {
    net.propagateForward(input[i]);
    net.propagateBackward(result[i]);

    float mape = std::abs(net._deltas.back()[0]) / result[i];

    if (mape > 1) {
      mape = 1;
    } else if (mape < 0) {
      mape = 0;
    }

    if (mapeHighest < mape) {
      mapeHighest = mape;
    }

    if (mapeLowest > mape) {
      mapeLowest = mape;
    }

    mapeAverage += mape;
  }

  std::cout << "H: " << mapeHighest * 100
    << ", M: " << mapeAverage / static_cast<float>(input.size()) * 100
    << ", L: " << mapeLowest * 100 << std::endl;

  redis->set("cashup_data", net.serialize());
}

std::vector<Matrix> Network::unserialize (const std::string &data) {
  std::vector<std::vector<std::vector<float>>> vec;

  bool isInsideI = false;
  bool isInsideJ = false;
  std::size_t capI = 0;
  std::size_t capJ = 0;
  std::string value;

  for (std::size_t i = 0, size = data.size(); i < size; i++) {
    char ch = data[i];

    if (ch == '[') {
      if (!isInsideI && i != 0) {
        isInsideI = true;
        vec.emplace_back();
        capI++;
        capJ = 0;
      } else if (i != 0) {
        isInsideJ = true;
        vec[capI - 1].emplace_back();
        capJ++;
      }
    } else if (ch == ']' || ch == ',') {
      if (!value.empty()) {
        vec[capI - 1][capJ - 1].emplace_back(stof(value));
        value.clear();
      }

      if (isInsideJ && ch == ']') {
        isInsideJ = false;
      } else if (isInsideI && ch == ']') {
        isInsideI = false;
      }
    } else if (isInsideJ) {
      value += ch;
    }
  }

  std::vector<Matrix> result;
  result.reserve(vec.size());

  for (std::size_t i = 0, sizeI = vec.size(); i < sizeI; i++) {
    std::size_t sizeJ = vec[i].size();
    std::size_t sizeK = vec[i].empty() ? 0 : vec[i][0].size();

    result.emplace_back(Matrix(sizeJ, sizeK));

    for (std::size_t j = 0; j < sizeJ; j++) {
      for (std::size_t k = 0; k < sizeK; k++) {
        result[i](j, k) = vec[i][j][k];
      }
    }
  }

  return result;
}

Network::Network (std::optional<std::vector<Matrix>> weights) {
  this->_deltas.reserve(Network::topology.size());
  this->_neurons.reserve(Network::topology.size());

  for (std::size_t i = 0, size = Network::topology.size(); i < size; i++) {
    this->_deltas.emplace_back(
      Vector(Network::topology[i] + (i != size - 1))
    );

    this->_neurons.emplace_back(
      Vector(Network::topology[i] + (i != size - 1))
    );

    if (i != size - 1) {
      this->_deltas.back()[Network::topology[i]] = 1.f;
      this->_neurons.back()[Network::topology[i]] = 1.f;
    }
  }

  if (weights) {
    this->_weights = *weights;
    return;
  }

  this->_weights.reserve(Network::topology.size() - 1);

  for (std::size_t i = 1, size = Network::topology.size(); i < size; i++) {
    this->_weights.emplace_back(
      Matrix(Network::topology[i - 1] + 1, Network::topology[i] + (i != size - 1))
    );

    this->_weights.back().setRandom(-10.f, 10.f);

    if (i != size - 1) {
      this->_weights.back().col(Network::topology[i]).setZero();
      this->_weights.back()(Network::topology[i - 1], Network::topology[i]) = 1.f;
    }
  }
}

void Network::propagateBackward (float result) {
  this->_deltas.back()[0] = result - this->result();

  for (std::size_t i = this->_neurons.size() - 2; i > 0; i--) {
    this->_deltas[i] = this->_deltas[i + 1] * this->_weights[i].transpose();
  }

  for (std::size_t i = 0, sizeI = this->_neurons.size() - 1; i < sizeI; i++) {
    for (std::size_t j = 0, sizeJ = this->_weights[i].cols() - (i != sizeI - 1); j < sizeJ; j++) {
      for (std::size_t k = 0, sizeK = this->_weights[i].rows(); k < sizeK; k++) {
        this->_weights[i](k, j) += Network::learningRate *
          this->_deltas[i + 1][j] *
          Network::activationDerivative(this->_neurons[i + 1][j]) *
          this->_neurons[i][k];
      }
    }
  }
}

void Network::propagateForward (const Vector &input) {
  this->_neurons[0].range(0, this->_neurons[0].size() - 1) = input;

  for (std::size_t i = 1, size = this->_neurons.size(); i < size; i++) {
    this->_neurons[i] = this->_neurons[i - 1] * this->_weights[i - 1];
    this->_neurons[i].range(0, this->_neurons[i].size() - (i != size - 1)).apply(Network::activation);
  }
}

float Network::result () const {
  return this->_neurons.back()[0];
}

std::string Network::serialize () const {
  std::string result = "[";

  for (std::size_t i = 0, sizeI = this->_weights.size(); i < sizeI; i++) {
    std::size_t sizeJ = this->_weights[i].rows();
    std::size_t sizeK = this->_weights[i].cols();

    if (i != 0) {
      result += ',';
    }

    result += "[";

    for (std::size_t j = 0; j < sizeJ; j++) {
      if (j != 0) {
        result += ',';
      }

      result += "[";

      for (std::size_t k = 0; k < sizeK; k++) {
        if (k != 0) {
          result += ',';
        }

        std::ostringstream ss;
        ss << this->_weights[i](j, k);

        result += ss.str();
      }

      result += "]";
    }

    result += "]";
  }

  return result + "]";
}
