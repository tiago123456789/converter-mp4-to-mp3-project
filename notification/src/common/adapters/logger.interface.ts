interface LoggerInterface {
  info(message: string, metadata: string | { [key: string]: any });
  error(message: string, metadata: string | { [key: string]: any });
}
