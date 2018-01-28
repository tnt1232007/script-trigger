export abstract class IWatchService {
  public abstract startWatching(fn: (message) => void);
  public abstract stopWatching();
}
