#include <algorithm>
#include <cstddef>
#include <stdexcept>
#include <vector>

#include "Redis.hpp"

std::map<std::string, std::string> Redis::parseURI (const std::string &uri) {
  std::map<std::string, std::string> parsed;

  if (uri.substr(0, 8) != "redis://") {
    throw std::invalid_argument("Redis URI supports only TCP protocol");
  }

  parsed["protocol"] = "tcp";

  std::string host = uri.substr(8);

  if (host.empty()) {
    throw std::invalid_argument("Redis URI is invalid");
  }

  std::vector<std::string> result;
  std::size_t pos;

  while ((pos = host.find(':')) != std::string::npos) {
    result.emplace_back(host.substr(0, pos));
    host.erase(0, pos + 1);
  }

  result.emplace_back(host);

  if (result.size() != 2) {
    throw std::invalid_argument("Redis URI is invalid");
  }

  parsed["hostname"] = result[0];
  parsed["port"] = result[1];

  if (!std::all_of(parsed["port"].begin(), parsed["port"].end(), isdigit)) {
    throw std::invalid_argument("Redis URI port should be a number");
  }

  return parsed;
}

Redis::Redis (const std::string &uri) {
  std::map<std::string, std::string> parsed = Redis::parseURI(uri);
  this->_ctx = redisConnect(parsed["hostname"].c_str(), stoi(parsed["port"]));

  if (this->_ctx->err != 0) {
    throw std::invalid_argument("Unable to connect to Redis");
  }
}

Redis::~Redis () {
  redisFree(this->_ctx);
}

bool Redis::del (const std::string &key) {
  auto reply = static_cast<redisReply *>(redisCommand(this->_ctx, "DEL %s", key.c_str()));

  if (reply->type == REDIS_REPLY_ERROR) {
    freeReplyObject(reply);
    throw std::runtime_error(this->_ctx->errstr);
  }

  bool cmdReply = reply->integer == 1;
  freeReplyObject(reply);

  return cmdReply;
}

bool Redis::exists (const std::string &key) {
  auto reply = static_cast<redisReply *>(redisCommand(this->_ctx, "EXISTS %s", key.c_str()));

  if (reply->type == REDIS_REPLY_ERROR) {
    freeReplyObject(reply);
    throw std::runtime_error(this->_ctx->errstr);
  }

  bool cmdReply = reply->integer == 1;
  freeReplyObject(reply);

  return cmdReply;
}

std::optional<std::string> Redis::get (const std::string &key) {
  auto reply = static_cast<redisReply *>(redisCommand(this->_ctx, "GET %s", key.c_str()));

  if (reply->type == REDIS_REPLY_ERROR) {
    freeReplyObject(reply);
    throw std::runtime_error(this->_ctx->errstr);
  } else if (reply->type == REDIS_REPLY_NIL) {
    freeReplyObject(reply);
    return std::nullopt;
  }

  std::string cmdReply(reply->str);
  freeReplyObject(reply);

  return cmdReply;
}

bool Redis::set (const std::string &key, const std::string &value) {
  auto reply = static_cast<redisReply *>(redisCommand(this->_ctx, "SET %s %s", key.c_str(), value.c_str()));

  if (reply->type == REDIS_REPLY_ERROR) {
    freeReplyObject(reply);
    throw std::runtime_error(this->_ctx->errstr);
  }

  std::string cmdReply(reply->str);
  freeReplyObject(reply);

  return cmdReply == "OK";
}
