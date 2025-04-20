
{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.nodePackages.npm
    pkgs.libuuid
    pkgs.pkg-config
    pkgs.cairo
    pkgs.pango
    pkgs.gtk3
    pkgs.libpng
    pkgs.giflib
    pkgs.fontconfig
    pkgs.freetype
  ];
}
