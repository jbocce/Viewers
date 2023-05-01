export type CloudServerDataSourcePathSeg = {
  name: string;
  friendlyName: string;
  value?: string;
};

abstract class CloudServerDataSourcePath {
  private _pathSegs: CloudServerDataSourcePathSeg[];

  constructor(...pathSegs: CloudServerDataSourcePathSeg[]) {
    this._pathSegs = pathSegs;
  }

  getPathSeg(pathSegIndex: number): CloudServerDataSourcePathSeg {
    return { ...this._pathSegs[pathSegIndex] };
  }

  setPathSegValue(pathSegIndex: number, value: string): void {
    this._pathSegs[pathSegIndex].value = value;
  }
}

export default CloudServerDataSourcePath;
