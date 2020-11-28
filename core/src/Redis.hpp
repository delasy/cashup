#ifndef SRC_REDIS_HPP
#define SRC_REDIS_HPP

#include <hiredis/hiredis.h>
#include <map>
#include <optional>
#include <string>

class Redis {
 public:
  static std::map<std::string, std::string> parseURI (const std::string &);

  explicit Redis (const std::string &);
  explicit Redis (const Redis &) = delete;
  Redis &operator= (const Redis &) = delete;
  ~Redis ();

  bool del (const std::string &);
  bool exists (const std::string &);
  std::optional<std::string> get (const std::string &);
  bool set (const std::string &, const std::string &);

 private:
  redisContext *_ctx;
};

#endif
