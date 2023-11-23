
W0=H0=300
noises = "+noise Gaussian -normalize "*10
init = "-size #{W0}x#{H0} xc:black -colorspace gray -depth 16"
blur = [
  "-gaussian-blur #{W0/5}x7 -normalize",
].join(" ")
%x(convert #{init} #{noises} #{blur} base.png)
%x(convert base.png -gaussian-blur #{W0/5}x10 -negate lowpass.png)
%x(composite -dissolve 50% base.png lowpass.png hoge.png)
%x(convert -negate hoge.png fuga.png)
%x(convert hoge.png fuga.png -gravity center -compose difference -composite  -normalize -negate -level 80%,100% w0.png)
%x(convert w0.png -gaussian-blur #{W0/10}x8 -negate lowpass_w.png)
%x(composite -dissolve 50% w0.png lowpass_w.png w.png)
GW=512+200
GH=900+200
W=H=GH
cubic="-filter cubic -define filter:b=1 -define filter:c=0"
%x(convert w.png -normalize -level 40%,100%  #{cubic} -resize #{W}x#{H} mono.png)
%x(convert mono.png -evaluate multiply 0 -negate white.png)
%x(convert white.png white.png white.png mono.png -combine  -gravity center -crop #{GW}x#{GH}+0+0 wave.png)
