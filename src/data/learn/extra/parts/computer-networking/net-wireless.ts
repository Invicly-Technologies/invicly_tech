import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-wireless/wifi-standards": {
    plain: [
      "Wi-Fi is a set of rules, written by a group called the IEEE, under the number 802.11. Every few years a new version adds speed and efficiency. Because names like 802.11ax are hard to remember, the Wi-Fi Alliance gave them simple numbers: Wi-Fi 4, 5, 6, 6E and 7.",
      "Wi-Fi uses radio waves in a few frequency bands: 2.4 GHz, 5 GHz and, for the newest devices, 6 GHz. Think of a band as a road. 2.4 GHz is a narrow country road that goes far and through walls, but it is crowded. 5 and 6 GHz are wide highways with many lanes, but they do not reach as far.",
      "Each band is cut into channels, which are the lanes. A device can use a narrow channel (20 MHz) or join several together into a wide one (40, 80, 160 or even 320 MHz). Wider means faster, but it also means fewer separate lanes for neighbours, so networks bump into each other more.",
      "Speed on the box is a best-case number in a lab. Real speed depends on how strong the signal is compared with the background noise, how many devices share the air, and how far you are from the access point. A strong, clean signal matters more than the newest standard.",
    ],
    deepDive: [
      {
        heading: "What each generation really added",
        body: "Wi-Fi 4 (802.11n, 2009) brought MIMO: several antennas sending separate data streams at the same time, up to four streams and 40 MHz channels, with a maximum of 600 Mbps. It works on 2.4 and 5 GHz.\n\nWi-Fi 5 (802.11ac, 2013) is 5 GHz only. It added 80 and 160 MHz channels, denser 256-QAM modulation, and downlink MU-MIMO, which lets an AP send to several clients at once.\n\nWi-Fi 6 (802.11ax, 2019) focused on crowded places rather than raw speed. OFDMA splits a channel into small pieces (resource units) so one transmission can serve many clients. It added 1024-QAM, uplink MU-MIMO, Target Wake Time to save battery, and BSS coloring to cope with neighbouring networks. Wi-Fi 6E is the same technology extended into 6 GHz.\n\nWi-Fi 7 (802.11be, certified since 2024) adds 320 MHz channels in 6 GHz, 4096-QAM, and Multi-Link Operation (MLO), which lets one device use several bands at once.",
        visual: {
          type: "flow",
          title: "Wi-Fi generations at a glance",
          steps: [
            { label: "Wi-Fi 4 (802.11n)", detail: "MIMO, 40 MHz, 2.4 and 5 GHz" },
            { label: "Wi-Fi 5 (802.11ac)", detail: "5 GHz, 80 or 160 MHz, downlink MU-MIMO" },
            { label: "Wi-Fi 6 (802.11ax)", detail: "OFDMA, 1024-QAM, Target Wake Time" },
            { label: "Wi-Fi 6E", detail: "Wi-Fi 6 in the 6 GHz band" },
            { label: "Wi-Fi 7 (802.11be)", detail: "320 MHz, 4096-QAM, Multi-Link Operation" },
          ],
        },
      },
      {
        heading: "Channels in each band",
        body: "In 2.4 GHz, channel numbers are only 5 MHz apart but each Wi-Fi channel is about 20 MHz wide, so neighbours overlap. Only 1, 6 and 11 avoid each other, and 40 MHz channels there are a bad idea because they eat two of the three lanes. Bluetooth, microwaves and baby monitors share the band.\n\n5 GHz has around 25 non-overlapping 20 MHz channels in many countries, grouped into UNII bands. Channels 52 to 144 are DFS (Dynamic Frequency Selection) channels shared with radar: an AP must listen before using them and must leave quickly if it detects radar, which can briefly drop clients. Channels 36 to 48 and, in the US, 149 to 165 avoid DFS.\n\n6 GHz offers up to 1200 MHz of spectrum in the US (59 channels of 20 MHz, or seven of 160 MHz) and 500 MHz in Europe. Only Wi-Fi 6E and 7 devices can use it, so it is free of older, slower clients.",
        bullets: ["2.4 GHz: use 1, 6, 11 at 20 MHz", "5 GHz: 20 or 40 MHz in dense offices, 80 MHz in homes", "DFS channels: more room, but radar can force a channel change", "6 GHz: wide channels, newest clients only, WPA3 required"],
      },
      {
        heading: "Signal, noise and dBm",
        body: "Radio power is measured in dBm, decibels relative to one milliwatt. 0 dBm is 1 mW, 20 dBm is 100 mW. Received Wi-Fi signals are tiny, so they are negative: -40 dBm is very strong, -67 dBm is a common target for voice and video, -75 dBm is weak, and below -80 dBm connections become unreliable. The scale is logarithmic: every 3 dB halves or doubles the power, and every 10 dB is a factor of ten.\n\nNoise is the background hiss, often around -90 to -95 dBm. SNR (signal-to-noise ratio) is simply signal minus noise in dB. A signal of -65 dBm with noise at -92 dBm gives an SNR of 27 dB. Higher SNR lets the radio use denser modulation and higher data rates. Dense schemes like 1024-QAM and 4096-QAM need a very clean signal, which in practice means being close to the AP. When SNR drops, the radio steps down to slower but sturdier rates.",
        visual: {
          type: "layers",
          title: "Reading received signal strength",
          layers: [
            { label: "-30 to -50 dBm", detail: "Excellent: next to the AP" },
            { label: "-50 to -67 dBm", detail: "Good: fine for voice and video" },
            { label: "-67 to -75 dBm", detail: "Fair: browsing works, calls may suffer" },
            { label: "-75 to -85 dBm", detail: "Poor: slow rates, drops" },
            { label: "Below -85 dBm", detail: "Near the noise floor: unusable" },
          ],
        },
      },
      {
        heading: "Why advertised speeds never appear",
        body: "A router sold as 5,400 Mbps adds up the best possible rate of all its bands with the widest channels, the most spatial streams and perfect signal. Your phone may have two antennas, not four or eight, so it gets a fraction of that. Wi-Fi is also half-duplex: only one device talks on a channel at a time (OFDMA and MU-MIMO soften this but do not remove it), and every frame needs gaps and acknowledgements. Real TCP throughput is often around half of the link rate shown by the device.\n\nThe air is shared, and time is what is shared. A slow old client far away takes much longer to send the same data, so it uses more airtime and slows everyone. This is why disabling the oldest 802.11b rates and adding APs close to users often helps more than buying the newest standard.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Wide channels versus narrow channels",
        columns: [
          { title: "Narrow (20 or 40 MHz)", points: ["Lower peak speed per client", "Many separate channels for neighbours", "Less co-channel interference", "Best for offices, schools, stadiums"] },
          { title: "Wide (80, 160 or 320 MHz)", points: ["High peak speed", "Few separate channels", "More likely to overlap other networks", "Best for homes and 6 GHz"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reading your own Wi-Fi link on Linux",
        explanation: "Your laptop feels slow on Wi-Fi. Step 1: look at the link: band (from the frequency), signal in dBm and the current bitrate. Step 2: compare with the networks around you to see whether neighbours share your channel. Here the laptop is on channel 6 at -71 dBm with a low bitrate, and three other networks also use channel 6. Step 3: move closer and switch to the 5 GHz SSID, then measure again.",
        code: {
          lang: "bash",
          code: "iw dev wlan0 link\n#   freq: 2437          (channel 6, 2.4 GHz)\n#   signal: -71 dBm\n#   tx bitrate: 26.0 MBit/s MCS 3\nnmcli -f SSID,BSSID,CHAN,FREQ,SIGNAL,SECURITY dev wifi list\n# Count other networks on CHAN 6, and look for a 5 GHz entry\n# (FREQ 5180 and up) for your own SSID.\n# Windows equivalent: netsh wlan show interfaces",
        },
      },
      {
        title: "Choosing bands for a small office",
        explanation: "A 20-person office has an old barcode scanner, phones and new laptops. Step 1: keep 2.4 GHz at 20 MHz on channel 1, 6 or 11 for the scanner and far corners. Step 2: run 5 GHz at 40 MHz on non-DFS channels such as 36 and 44, so neighbouring APs do not share a channel. Step 3: if the APs support it, enable 6 GHz at 80 MHz for the new laptops, which will move there and free 5 GHz for the phones. Step 4: measure signal at every desk; aim for -67 dBm or better.",
      },
    ],
    cheatSheet: [
      "Wi-Fi 4 = 802.11n, 5 = 802.11ac, 6 and 6E = 802.11ax, 7 = 802.11be",
      "2.4 GHz non-overlapping channels: 1, 6, 11 at 20 MHz",
      "5 GHz DFS channels 52 to 144 can be forced to change if radar is detected",
      "6 GHz: Wi-Fi 6E and 7 only, WPA3 required, up to 320 MHz channels with Wi-Fi 7",
      "Target -67 dBm or better for voice and video; below -80 dBm is unreliable",
      "SNR = signal minus noise; 25 dB or more is healthy",
      "Every 3 dB doubles or halves the power",
      "iw dev wlan0 link and netsh wlan show interfaces show signal, channel and rate",
    ],
    quiz: [
      {
        q: "Which Wi-Fi generation introduced OFDMA to serve many clients in one transmission?",
        options: ["Wi-Fi 4", "Wi-Fi 5", "Wi-Fi 6", "Only Wi-Fi 7"],
        answer: 2,
        why: "OFDMA arrived with 802.11ax (Wi-Fi 6) to handle crowded networks more efficiently.",
      },
      {
        q: "A signal of -62 dBm with a noise floor of -90 dBm gives what SNR?",
        options: ["28 dB", "152 dB", "-28 dB", "62 dB"],
        answer: 0,
        why: "SNR is signal minus noise: -62 minus -90 equals 28 dB.",
      },
      {
        q: "Why are 40 MHz channels a bad idea on 2.4 GHz in an office?",
        options: ["2.4 GHz does not support them", "They need WPA3", "They only work outdoors", "They use up most of the few non-overlapping channels and cause interference"],
        answer: 3,
        why: "2.4 GHz has only three clean 20 MHz lanes, and a 40 MHz channel occupies two of them.",
      },
      {
        q: "What is special about 5 GHz DFS channels?",
        options: ["They are reserved for Wi-Fi 7", "They are shared with radar, so APs must check for it and move away if detected", "They are always faster", "They work only on 2.4 GHz radios"],
        answer: 1,
        why: "Dynamic Frequency Selection protects radar systems, which can force a sudden channel change.",
      },
      {
        q: "Which change usually helps a slow, crowded Wi-Fi network most?",
        options: ["Raising every AP to maximum power", "Using 160 MHz channels everywhere", "Adding APs closer to users with narrower channels", "Hiding the SSID"],
        answer: 2,
        why: "Closer APs give stronger signals and faster rates, and narrower channels reduce overlap between APs.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Check your current Wi-Fi connection and write down band, channel, signal strength and link rate.",
        hint: "Linux: iw or nmcli. Windows: netsh. macOS: hold Option and click the Wi-Fi icon.",
        solution: "Linux:   iw dev wlan0 link\nWindows: netsh wlan show interfaces\n         (Channel, Signal %, Radio type, Receive rate)\nmacOS:   Option-click the Wi-Fi icon\n         (Channel, RSSI, Noise, Tx Rate)\nBand from frequency: 2412-2484 = 2.4 GHz,\n5170-5895 = 5 GHz, 5925 and up = 6 GHz.",
      },
      {
        level: "medium",
        task: "Walk through your home or office, measuring signal at five spots, and decide where coverage is too weak for a video call.",
        hint: "Use the same tool at each spot, wait a few seconds, and note the dBm value.",
        solution: "while true; do\n  iw dev wlan0 link | awk '/signal/ {print $2, $3}'\n  sleep 2\ndone\n# Note the value at each spot.\n# -67 dBm or better: fine for calls\n# -67 to -75: borderline\n# worse than -75: add or move an AP",
      },
      {
        level: "hard",
        task: "List every network your adapter can hear, group them by channel, and pick the least crowded 2.4 GHz channel among 1, 6 and 11.",
        hint: "nmcli can print terse output with -t, which is easy to process with sort and uniq.",
        solution: "nmcli -t -f CHAN dev wifi list --rescan yes \\\n  | sort -n | uniq -c | sort -rn\n# e.g.  7 6\n#       4 1\n#       2 11\n#       3 36\n# Among 1, 6 and 11, channel 11 has the fewest networks.\n# Also weigh signal strength: one very strong neighbour\n# can matter more than several faint ones.",
      },
    ],
    faq: [
      { q: "Is 5 GHz always better than 2.4 GHz?", a: "It is usually faster and less crowded, but it does not travel as far or through walls as well. Far from the AP, 2.4 GHz may give a more stable connection." },
      { q: "Do I need a Wi-Fi 7 router?", a: "Only if your devices support Wi-Fi 7 and your internet or local transfers are faster than Wi-Fi 6 can carry. Good AP placement usually matters more than the generation." },
      { q: "Why does my phone show full bars but Wi-Fi is slow?", a: "Bars show signal strength only. The channel may be crowded, the AP may be overloaded, or the slowdown may be in the internet connection itself." },
    ],
  },

  "net-wireless/wifi-operation": {
    plain: [
      "An access point (AP) is the box that links wireless devices to the wired network. Every AP regularly shouts a short message called a beacon, about ten times a second, saying: I am here, my network is called Office, and this is how to join me. The network name is the SSID.",
      "Your phone listens for these beacons, or asks out loud with a probe request: is the network Office here? It then picks the AP with the best signal, introduces itself (authentication), and asks to join (association). After that comes the security handshake, and then DHCP to get an IP address.",
      "Radio is a shared room where only one person can speak at a time on each channel. Wi-Fi devices politely listen first, wait a random short time, and speak only if the room is quiet. This is called CSMA/CA (carrier sense multiple access with collision avoidance).",
      "A big building needs many APs with the same SSID. As you walk around, your device decides when to move to a closer AP, which is called roaming. Good channel planning keeps neighbouring APs on different channels so they do not shout over each other.",
    ],
    deepDive: [
      {
        heading: "SSID, BSSID and ESS",
        body: "A BSS (basic service set) is one AP radio plus the clients joined to it, and the BSSID is that radio's MAC address. An AP with a 2.4 GHz radio, a 5 GHz radio and three SSIDs typically has six BSSIDs, one per SSID per radio, each with a slightly different MAC. An ESS (extended service set) is a group of BSSs sharing one SSID and the same wired network, which is what lets clients roam.\n\nThe SSID is just a name of up to 32 bytes. Clients cannot tell two networks apart by name alone, which is why anyone can create a fake network with your SSID. Hiding the SSID only removes it from beacons; clients then send probe requests containing the name everywhere they go, so it adds no security.\n\nEach beacon, sent by default every 102.4 ms, lists the SSID, supported rates, security settings and capabilities. Beacons are sent at the lowest enabled rate, so many SSIDs on many APs can waste a large share of airtime.",
        bullets: ["Keep to three or four SSIDs per AP", "Raising the minimum data rate makes beacons shorter", "Each extra SSID adds its own beacons on every radio"],
      },
      {
        heading: "Frame types and the join process",
        body: "802.11 has three kinds of frames. Management frames run the network: beacons, probe requests and responses, authentication, association, reassociation, disassociation and deauthentication. Control frames help deliver data: ACK, RTS, CTS and Block Ack. Data frames carry your traffic.\n\nJoining follows a fixed order. Discovery is passive (listening for beacons on each channel) or active (sending probe requests). The authentication frames come next; for WPA2 this is Open System, a formality, and for WPA3-Personal it carries the SAE exchange. Then the client sends an association request with its capabilities, and the AP returns an association response with an association ID. Only then does the four-way handshake create encryption keys, after which normal data, starting with DHCP, can flow.\n\nWhen a client hops to another AP in the same ESS it sends a reassociation request instead, naming its previous AP.",
        visual: {
          type: "flow",
          title: "From power-on to first packet",
          steps: [
            { label: "Scan", detail: "Hear beacons or send probe requests" },
            { label: "Authenticate", detail: "Open System, or SAE for WPA3" },
            { label: "Associate", detail: "Request and response, AID assigned" },
            { label: "Key handshake", detail: "802.1X if enterprise, then four-way handshake" },
            { label: "DHCP and ARP", detail: "Get an IP, find the gateway" },
            { label: "Data", detail: "Encrypted frames to and from the AP" },
          ],
        },
      },
      {
        heading: "CSMA/CA: taking turns on the air",
        body: "Wired Ethernet once detected collisions while sending, but a radio cannot hear others while it transmits, so Wi-Fi avoids collisions instead. Before sending, a station checks that the channel is idle (clear channel assessment). It also respects the Duration field in frames it overhears, which sets a timer called the NAV: everyone stays quiet until the current exchange ends.\n\nWhen the channel goes idle, the station waits a fixed gap, then a random backoff counted in slots. The random number comes from a contention window that starts small and doubles after each failed attempt. The receiver confirms each frame with an ACK after a short gap (SIFS); no ACK means the sender assumes a collision and retries.\n\nWMM (Wi-Fi Multimedia) gives voice and video shorter waits and smaller windows than background traffic, so calls get through first. In the hidden-node case, where two clients cannot hear each other but both reach the AP, RTS and CTS frames reserve the channel first.",
        visual: {
          type: "sequence",
          title: "Sending one frame with RTS/CTS",
          actors: ["Laptop", "Access point", "Other client"],
          messages: [
            { from: 0, to: 1, label: "RTS: I need the channel for 300 microseconds" },
            { from: 1, to: 0, label: "CTS: go ahead" },
            { from: 1, to: 2, label: "Same CTS heard: set NAV, stay quiet" },
            { from: 0, to: 1, label: "Data frame" },
            { from: 1, to: 0, label: "ACK after SIFS" },
          ],
        },
      },
      {
        heading: "Roaming: the client decides",
        body: "In Wi-Fi, the client, not the network, decides when to roam. Most clients wait until the signal is fairly weak, often around -70 to -75 dBm, before scanning for a better AP. A sticky client is one that clings to a distant AP while a closer one is available, dragging down its own speed and that AP's airtime.\n\nThree amendments help. 802.11k lets the AP hand the client a neighbour report, a short list of nearby APs and their channels, so it does not scan every channel. 802.11v lets the network suggest a better AP with a BSS transition management request; the client may still refuse. 802.11r (Fast BSS Transition) pre-shares keys so the client can skip the full 802.1X login on each hop, cutting roam time to well under the 50 ms that voice calls can tolerate.\n\nFor smooth roaming, design cells to overlap by about 15 to 20 percent at -67 dBm, so a better AP is always in reach.",
      },
      {
        heading: "Planning channels and power for several APs",
        body: "Two APs on the same channel that can hear each other share airtime as if they were one, which is called co-channel contention. The plan is to make neighbours use different channels: 1, 6 and 11 in 2.4 GHz in a repeating pattern, and 20 or 40 MHz channels spread across 5 GHz.\n\nPower matters as much as channels. Full power makes big cells that overlap heavily and encourages sticky clients. Phones transmit with less power than APs, so an AP shouting at 100 mW to a phone that answers at 15 mW creates a lopsided link. Moderate AP power and more APs give better results. In dense designs, turn off the 2.4 GHz radio on some APs, because there are only three channels to share.\n\nEnterprise systems often adjust channels and power automatically (radio resource management), but always check the result with a site survey: walk the building with a survey tool and map the actual signal.",
        bullets: ["Same channel + can hear each other = shared airtime", "Lower power, more APs, smaller cells", "Disable some 2.4 GHz radios in dense layouts", "Verify with a site survey, not a floor plan guess"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "802.11 frame types",
        root: "802.11 frames",
        children: [
          { label: "Management", children: ["Beacon", "Probe request and response", "Authentication", "Association and reassociation", "Deauthentication and disassociation"] },
          { label: "Control", children: ["ACK", "RTS and CTS", "Block Ack"] },
          { label: "Data", children: ["Your packets", "QoS data with WMM priority", "Null data for power saving"] },
        ],
      },
    ],
    examples: [
      {
        title: "Finding out why calls drop in one corridor",
        explanation: "Users say Teams calls break when they walk from the meeting rooms to the kitchen. Step 1: walk the path with a laptop printing the BSSID and signal every second. Step 2: you see the laptop holding on to AP-1 down to -80 dBm before jumping to AP-2: a sticky roam with a gap. Step 3: enable 802.11k and 802.11v so the network can steer clients, enable 802.11r for fast transitions, and lower AP-1's power so its cell does not stretch so far.",
        code: {
          lang: "bash",
          code: "while true; do\n  iw dev wlan0 link | awk '/Connected to/ {b=$3} /signal/ {s=$2} END {print b, s}'\n  sleep 1\ndone\n# 3c:84:6a:11:22:31 -66\n# 3c:84:6a:11:22:31 -74\n# 3c:84:6a:11:22:31 -80   <- should have roamed earlier\n# 3c:84:6a:44:55:61 -58   <- finally on AP-2",
        },
      },
      {
        title: "A channel plan for six APs",
        explanation: "An office has six APs in two rows of three. Step 1: 2.4 GHz alternates 1, 6, 11 along the first row and 11, 1, 6 along the second, so no AP shares a channel with its closest neighbours. Step 2: 5 GHz uses 40 MHz channels 36, 44, 149 in row one and 157, 36, 44 in row two, avoiding DFS for stability. Step 3: set AP power to medium, and turn off 2.4 GHz on two middle APs if surveys show overlap. Step 4: survey again and adjust.",
      },
    ],
    cheatSheet: [
      "SSID = network name; BSSID = one AP radio's MAC; ESS = APs sharing an SSID",
      "Beacon interval: 100 TU = 102.4 ms by default",
      "Join order: scan, authenticate, associate, four-way handshake, DHCP",
      "802.11k neighbour reports, 802.11v steering suggestions, 802.11r fast transition",
      "Design for -67 dBm at cell edges with about 15 to 20 percent overlap",
      "Hidden SSIDs add no security and make clients probe for the name everywhere",
      "Fewer SSIDs and higher minimum rates leave more airtime for data",
    ],
    quiz: [
      {
        q: "An AP has two radios and broadcasts three SSIDs on each. How many BSSIDs does it typically use?",
        options: ["1", "2", "3", "6"],
        answer: 3,
        why: "Each SSID on each radio gets its own BSSID, so 2 radios times 3 SSIDs gives 6.",
      },
      {
        q: "Who decides when a Wi-Fi client roams to another AP?",
        options: ["The client", "The DHCP server", "The nearest AP alone", "The router"],
        answer: 0,
        why: "Roaming is client-driven; 802.11k and v let the network help, but the client chooses.",
      },
      {
        q: "What problem do RTS and CTS frames solve?",
        options: ["Weak encryption", "Too many SSIDs", "Hidden nodes that cannot hear each other but both reach the AP", "DHCP failures"],
        answer: 2,
        why: "The CTS from the AP is heard by everyone, so hidden clients know to stay quiet.",
      },
      {
        q: "Which amendment lets a client skip a full 802.1X login on each roam?",
        options: ["802.11k", "802.11r", "802.11v", "802.11ax"],
        answer: 1,
        why: "802.11r (Fast BSS Transition) derives keys in advance so roams are quick.",
      },
      {
        q: "Why is running every AP at maximum power usually a mistake?",
        options: ["It creates large overlapping cells and sticky clients that cannot talk back as loudly", "It disables WPA3", "It breaks DHCP", "Beacons stop working"],
        answer: 0,
        why: "Phones transmit weaker than APs, and big cells mean more co-channel contention.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the BSSID, channel and security type of the AP you are connected to, and how many BSSIDs share your SSID nearby.",
        hint: "nmcli lists BSSIDs; the one marked with * is in use.",
        solution: "nmcli -f IN-USE,SSID,BSSID,CHAN,SIGNAL,SECURITY dev wifi list\n# * marks your current BSSID.\n# Count rows with the same SSID: that is how many\n# AP radios in range belong to your ESS.\n# Windows: netsh wlan show networks mode=bssid",
      },
      {
        level: "medium",
        task: "Capture the beacons and probe responses around you and list each SSID with its BSSID and channel.",
        hint: "This needs a card in monitor mode, or open a Wi-Fi capture in Wireshark and filter by frame subtype.",
        solution: "sudo iw dev wlan0 interface add mon0 type monitor\nsudo ip link set mon0 up\nsudo iw dev mon0 set channel 6\nsudo tcpdump -i mon0 -e -c 50 'type mgt subtype beacon'\n# In Wireshark the display filter is:\n# wlan.fc.type_subtype == 0x0008   (beacons)\n# wlan.fc.type_subtype == 0x0005   (probe responses)\nsudo iw dev mon0 del",
      },
      {
        level: "hard",
        task: "Design a channel and power plan for a two-floor office with four APs per floor, and explain how you avoid co-channel interference between floors.",
        hint: "APs above and below can hear each other too, so plan in three dimensions.",
        solution: "Floor 1 (2.4 GHz): 1, 6, 11, 1 in a line\nFloor 2 (2.4 GHz): 11, 1, 6, 11 so no AP sits above\n  one on the same channel; disable 2.4 GHz on one AP per floor\n5 GHz 40 MHz: floor 1 uses 36, 44, 149, 157;\n  floor 2 uses 52, 60, 100, 108 if DFS is acceptable,\n  otherwise shift the pattern so stacked APs differ\nPower: medium, so cells overlap 15 to 20 percent at -67 dBm\nVerify with a survey on both floors and adjust",
      },
    ],
    faq: [
      { q: "Should I hide my SSID for security?", a: "No. Hidden networks are still visible to anyone with a capture tool, and your devices broadcast the name in probe requests wherever they go." },
      { q: "Why does my laptop stay connected to a far-away AP?", a: "The client chooses when to roam and many wait until the signal is very weak. Enabling 802.11k and v on the network and lowering AP power usually helps." },
      { q: "Is a mesh system the same as several APs?", a: "Mesh APs connect to each other wirelessly instead of by cable, which uses some airtime for the backhaul. Wired APs on the same SSID perform better when cabling is possible." },
    ],
  },

  "net-wireless/wifi-security": {
    plain: [
      "On a wired network, an attacker has to plug into a cable. On Wi-Fi, anyone in the car park can receive your traffic. So wireless security has two jobs: decide who may join (authentication), and scramble every frame so outsiders cannot read it (encryption).",
      "Home networks usually use one shared password, called a pre-shared key or PSK. Everyone who knows it can join. Companies use 802.1X instead, where each person logs in with their own account or certificate, checked by a central server. When someone leaves the company, you disable one account instead of changing the password for everyone.",
      "The protection has improved over the years. WEP, from the 1990s, is completely broken. WPA2 is still common and safe with a long password. WPA3 is the current standard and resists the password-guessing attacks that work against WPA2.",
      "Attackers also try tricks that do not break the encryption at all, such as setting up a fake network with your company's name. Good settings on the devices, especially checking the server's certificate, are what stop these.",
    ],
    deepDive: [
      {
        heading: "From WEP to WPA3",
        body: "WEP used the RC4 cipher with a 24-bit initialisation vector, which repeats quickly on a busy network; tools can recover the key in minutes. WPA (2003) was a stop-gap called TKIP that ran on old hardware; it is deprecated too. WPA2 (2004) brought CCMP, based on AES, which is still strong. Its weak point is the PSK mode: anyone who records a handshake can test password guesses offline at high speed.\n\nWPA3 (2018) replaces the PSK exchange with SAE (Simultaneous Authentication of Equals), a password-authenticated key exchange. Each guess requires a live exchange with the AP, so offline cracking does not work, and each session gets forward secrecy. WPA3 also requires Protected Management Frames (802.11w), which stop attackers forging deauthentication frames. WPA3-Enterprise offers a 192-bit mode for high-security sites, and Wi-Fi Enhanced Open (OWE) encrypts open guest networks without a password.\n\nThe 6 GHz band allows only WPA3 or OWE.",
        visual: {
          type: "flow",
          title: "The history of Wi-Fi security",
          steps: [
            { label: "WEP (1999)", detail: "RC4, short IVs: broken in minutes" },
            { label: "WPA with TKIP (2003)", detail: "Interim fix, now deprecated" },
            { label: "WPA2 with CCMP (2004)", detail: "AES; PSK open to offline guessing" },
            { label: "WPA3 with SAE (2018)", detail: "No offline guessing, PMF required" },
          ],
        },
      },
      {
        heading: "The four-way handshake, step by step",
        body: "Both the AP and the client start with a shared PMK (pairwise master key). In PSK mode it is computed from the passphrase and the SSID with PBKDF2 (4096 rounds of HMAC-SHA1). In WPA3 it comes from SAE, and in enterprise mode from the 802.1X login. The PMK is never sent over the air.\n\nIn message 1 the AP sends a random number, the ANonce. The client creates its own SNonce and now computes the PTK (pairwise transient key) from the PMK, both nonces and both MAC addresses. Message 2 carries the SNonce and a MIC (message integrity code) that proves the client knows the PMK. The AP computes the same PTK and checks the MIC. Message 3 carries the group key (GTK) for broadcast traffic, encrypted, with its own MIC. Message 4 confirms, and both sides install the keys.\n\nIn WPA2-PSK, messages 1 and 2 are enough for an attacker to test password guesses offline, which is why short passphrases fall quickly.",
        visual: {
          type: "sequence",
          title: "Four-way handshake",
          actors: ["Client (supplicant)", "Access point"],
          messages: [
            { from: 1, to: 0, label: "Message 1: ANonce" },
            { from: 0, to: 1, label: "Message 2: SNonce + MIC" },
            { from: 1, to: 0, label: "Message 3: encrypted GTK + MIC" },
            { from: 0, to: 1, label: "Message 4: confirm" },
            { from: 0, to: 1, label: "Both install keys, data is encrypted" },
          ],
        },
      },
      {
        heading: "802.1X: one login per person",
        body: "802.1X has three roles. The supplicant is the client device. The authenticator is the AP (or switch), which blocks everything except authentication traffic until the user is approved. The authentication server is usually RADIUS, reached on UDP port 1812 (and 1813 for accounting). Between the client and the AP, authentication runs as EAP over LAN (EAPOL); the AP relays it inside RADIUS.\n\nThe EAP method decides how users prove who they are. EAP-TLS uses certificates on both sides and is the strongest, with no passwords to phish. PEAP with MSCHAPv2 wraps a username and password inside a TLS tunnel; it is easy to roll out but only safe if clients verify the server certificate. When the login succeeds, the RADIUS server sends the PMK material to the AP, and the four-way handshake follows.\n\nRADIUS can also return a VLAN for each user, so staff, contractors and devices land in different networks on the same SSID.",
      },
      {
        heading: "Rogue APs, evil twins and other attacks",
        body: "A rogue AP is an unauthorised AP connected to your wired network, often plugged in by an employee for convenience, which creates a back door. An evil twin is an attacker's AP that copies your SSID, sometimes with a stronger signal, to lure clients and capture their traffic or logins. Some attackers answer any probe request with the name the client asks for.\n\nDeauthentication attacks send forged deauth frames to kick clients off, either for disruption or to force them to reconnect to an evil twin or redo a handshake the attacker can capture. Protected Management Frames block forged deauth frames, which is one reason WPA3 makes them mandatory.\n\nWPS, the push-button setup feature, has a PIN mode that can be brute-forced in hours because the 8-digit PIN is checked in two halves. Disable WPS on every router.\n\nDefences: 802.1X with strict server-certificate validation, wireless intrusion detection that reports unknown BSSIDs, 802.1X or NAC on wired ports, and PMF.",
        bullets: ["Rogue AP: unauthorised AP on your wired LAN", "Evil twin: fake AP outside, same SSID", "Deauth flood: kicks clients off; PMF blocks it", "WPS PIN: brute-forceable, turn it off"],
      },
      {
        heading: "Choosing a mode in practice",
        body: "For a home or very small office, use WPA3-Personal if all devices support it; otherwise use WPA2/WPA3 transition mode, which offers both on one SSID. Transition mode lets an attacker push capable clients down to WPA2, so move to WPA3-only when old devices are gone. Whichever you use, choose a long random passphrase of at least 16 characters.\n\nFor a business, use WPA2- or WPA3-Enterprise with 802.1X, preferably EAP-TLS with certificates pushed by your device management system. Put guests on a separate SSID and VLAN that can reach only the internet, ideally using OWE so their traffic is still encrypted. IoT devices that only support PSK get their own SSID and VLAN with tight firewall rules.\n\nThings that do not help: MAC filtering (MAC addresses are visible and easy to copy) and hiding the SSID.",
        visual: {
          type: "compare",
          title: "Personal versus Enterprise",
          columns: [
            { title: "Personal (PSK or SAE)", points: ["One passphrase for all", "Changing it affects everyone", "No per-user logs", "Fine for homes and IoT"] },
            { title: "Enterprise (802.1X)", points: ["Each user or device logs in", "Revoke one account at a time", "RADIUS logs and per-user VLANs", "Needs a RADIUS server and certificates"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What protects a WPA3-Enterprise connection",
        layers: [
          { label: "Policy and VLAN", detail: "RADIUS assigns the user's network" },
          { label: "802.1X with EAP-TLS", detail: "User and server prove identity with certificates" },
          { label: "Four-way handshake", detail: "Fresh keys for this session" },
          { label: "Protected Management Frames", detail: "Forged deauth frames are rejected" },
          { label: "Encrypted data frames", detail: "CCMP or GCMP with AES" },
        ],
      },
    ],
    examples: [
      {
        title: "Configuring WPA2/WPA3 transition mode with hostapd",
        explanation: "A Linux-based AP must support new laptops on WPA3 and an old printer that only knows WPA2. Step 1: list both key management types, SAE and WPA-PSK. Step 2: make PMF optional (ieee80211w=1), because WPA2 clients may not support it; SAE clients will still use it. Step 3: use CCMP only, no TKIP. Step 4: once the printer is replaced, change wpa_key_mgmt to SAE and ieee80211w to 2 for WPA3-only.",
        code: {
          lang: "ini",
          code: "# /etc/hostapd/hostapd.conf (excerpt)\ninterface=wlan0\nssid=Office\nhw_mode=a\nchannel=36\nwpa=2\nwpa_key_mgmt=WPA-PSK SAE\nrsn_pairwise=CCMP\nieee80211w=1\nwpa_passphrase=use-a-long-random-passphrase-here\n# WPA3-only later:\n# wpa_key_mgmt=SAE\n# ieee80211w=2",
        },
      },
      {
        title: "Investigating a suspected evil twin",
        explanation: "Several users report a certificate warning when joining Corp-WiFi in the lobby. Step 1: scan and list every BSSID advertising Corp-WiFi. Step 2: compare them with your AP inventory; here one BSSID has an unknown vendor prefix and shows open or PSK security instead of 802.1X. Step 3: locate it by walking with the signal reading. Step 4: tell users never to accept unknown certificates, and push a Wi-Fi profile that pins your RADIUS server name and CA so devices refuse impostors automatically.",
        code: {
          lang: "bash",
          code: "nmcli -f SSID,BSSID,CHAN,SIGNAL,SECURITY dev wifi list | grep Corp-WiFi\n# Corp-WiFi  3C:84:6A:11:22:31  36  70  WPA2 802.1X\n# Corp-WiFi  3C:84:6A:44:55:61  44  62  WPA2 802.1X\n# Corp-WiFi  02:1A:2B:3C:4D:5E  6   85  WPA2        <- not ours\n# Locally administered MAC and no 802.1X: likely an evil twin",
        },
      },
    ],
    cheatSheet: [
      "Never use WEP or WPA/TKIP; use WPA3, or WPA2/WPA3 transition mode for old devices",
      "WPA2-PSK handshakes can be cracked offline; use 16+ random characters",
      "WPA3-SAE resists offline guessing and gives forward secrecy",
      "802.1X roles: supplicant, authenticator (AP), authentication server (RADIUS 1812/1813)",
      "EAP-TLS is strongest; PEAP is only safe if clients validate the server certificate",
      "Protected Management Frames (802.11w) stop forged deauth frames",
      "Disable WPS; MAC filtering and hidden SSIDs are not security",
      "6 GHz allows only WPA3 or OWE",
    ],
    quiz: [
      {
        q: "Why is WPA2-PSK with a short passphrase dangerous?",
        options: ["The AES cipher is broken", "Anyone who captures a handshake can test guesses offline", "It sends the password in clear text", "It disables encryption after an hour"],
        answer: 1,
        why: "The first two handshake messages let an attacker check guesses without talking to the AP again.",
      },
      {
        q: "In 802.1X, which role does the access point play?",
        options: ["Authentication server", "Supplicant", "Certificate authority", "Authenticator"],
        answer: 3,
        why: "The AP is the authenticator: it relays EAP to RADIUS and blocks traffic until the user is approved.",
      },
      {
        q: "What does message 3 of the four-way handshake deliver?",
        options: ["The encrypted group key (GTK) with a MIC", "The passphrase", "The client's SNonce", "The RADIUS shared secret"],
        answer: 0,
        why: "Message 3 carries the GTK, encrypted, so the client can decrypt broadcast and multicast traffic.",
      },
      {
        q: "What makes PEAP-MSCHAPv2 vulnerable to an evil twin?",
        options: ["It does not use TLS", "It requires WPS", "Clients that do not validate the server certificate will send their login to the fake AP", "It works only on 2.4 GHz"],
        answer: 2,
        why: "Without certificate checks, a fake RADIUS server can complete the tunnel and capture crackable credentials.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Check which security mode your home network and your phone hotspot use, and whether WPS is enabled on your router.",
        hint: "nmcli or netsh shows the security per network; WPS is in the router's admin page.",
        solution: "nmcli -f SSID,SECURITY dev wifi list\n# e.g. HomeNet  WPA2 WPA3   (transition mode)\n# Windows: netsh wlan show interfaces  (Authentication line)\nRouter admin page: wireless or WPS section,\nturn WPS off and save.\nIf all devices support it, switch to WPA3-Personal.",
      },
      {
        level: "medium",
        task: "Capture a four-way handshake on your own lab network and identify all four EAPOL messages in Wireshark.",
        hint: "Capture in monitor mode on the AP's channel, then disconnect and reconnect a client you own.",
        solution: "sudo iw dev wlan0 interface add mon0 type monitor\nsudo ip link set mon0 up && sudo iw dev mon0 set channel 36\nsudo tcpdump -i mon0 -w hs.pcap\n# reconnect your own phone to the lab SSID, then stop\nWireshark display filter: eapol\n# Info column shows Message 1 of 4 ... Message 4 of 4\n# Message 1 holds the ANonce, Message 2 the SNonce and MIC",
      },
      {
        level: "hard",
        task: "Design wireless access for a company with staff laptops, guests, and IoT sensors that only support WPA2-PSK. Specify SSIDs, security modes, VLANs and the key firewall rules.",
        hint: "Separate by trust level, and decide what each group may reach.",
        solution: "SSID Corp: WPA3-Enterprise, EAP-TLS, certs from MDM,\n  RADIUS assigns VLAN 10 (staff) or 20 (contractors)\nSSID Guest: OWE (Enhanced Open) or WPA3-Personal,\n  VLAN 30, internet only, client isolation on\nSSID IoT: WPA2-PSK long random key, PMF optional,\n  VLAN 40, may reach only the sensor server on its port\nFirewall: VLAN 30 and 40 cannot reach 10 or 20;\n  VLAN 40 to sensor server TCP 8883 only\nWIDS: alert on unknown BSSIDs using the Corp SSID",
      },
    ],
    faq: [
      { q: "Is WPA2 still safe to use?", a: "With a long random passphrase or with 802.1X, WPA2 with AES is still considered safe. WPA3 is better because it removes offline password guessing and makes management frame protection mandatory." },
      { q: "Can someone on the same Wi-Fi see my traffic?", a: "With WPA2 or WPA3, each client has its own keys, but anyone who knows a PSK and captures your handshake can derive yours on WPA2. HTTPS and a VPN protect you regardless." },
      { q: "What is WPA2/WPA3 transition mode?", a: "It lets one SSID accept both WPA2 and WPA3 clients during a migration. It is less secure than WPA3-only because attackers can push clients down to WPA2." },
      { q: "What is the difference between a rogue AP and an evil twin?", a: "A rogue AP is an unauthorised device plugged into your wired network. An evil twin is an attacker's AP that imitates your network name to trick clients into joining it." },
    ],
  },
};

export default extra;
