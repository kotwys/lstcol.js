{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  buildInputs = builtins.attrValues {
    inherit (pkgs) nodejs;
    inherit (pkgs.nodePackages) typescript-language-server;
  };
}
