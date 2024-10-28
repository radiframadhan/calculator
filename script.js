document.getElementById('calculate-button').onclick = calculateIPv4;

function calculateIPv4() {
    const ipv4Input = document.getElementById('ipv4-input').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ""; // Clear previous results

    const [address, prefixLength] = ipv4Input.split('/');
    if (!isValidIPv4(address) || !isValidPrefixLength(prefixLength)) {
        resultDiv.innerHTML = `<p style="color: red;">Invalid IPv4 address or prefix length.</p>`;
        return;
    }

    const subnetMask = getSubnetMask(prefixLength);
    const networkAddress = calculateNetworkAddress(address, subnetMask);
    const broadcastAddress = calculateBroadcastAddress(networkAddress, subnetMask);
    const totalHosts = Math.pow(2, 32 - prefixLength);
    const usableHosts = totalHosts - 2;
    const hostMin = calculateUsableAddress(networkAddress, 1);
    const hostMax = calculateUsableAddress(broadcastAddress, -1);
    const wildcardMask = getWildcardMask(subnetMask);

    resultDiv.innerHTML = `
        <div class="result-item"><strong>Address:</strong> ${address}/${prefixLength}</div>
        <div class="result-item"><strong>Netmask:</strong> ${subnetMask} = ${prefixLength}</div>
        <div class="result-item binary"><strong>Binary Netmask:</strong> ${toBinary(subnetMask)}</div>
        <div class="result-item"><strong>Wildcard:</strong> ${wildcardMask}</div>
        <div class="result-item"><strong>Network:</strong> ${networkAddress}</div>
        <div class="result-item"><strong>Broadcast:</strong> ${broadcastAddress}</div>
        <div class="result-item"><strong>HostMin:</strong> ${hostMin}</div>
        <div class="result-item"><strong>HostMax:</strong> ${hostMax}</div>
        <div class="result-item"><strong>Hosts/Net:</strong> ${usableHosts}</div>
    `;
}

function isValidIPv4(address) {
    const parts = address.split('.');
    return parts.length === 4 && parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
    });
}

function isValidPrefixLength(prefix) {
    const num = parseInt(prefix);
    return num >= 0 && num <= 32;
}

function getSubnetMask(prefixLength) {
    return Array(4).fill(0).map((_, i) => {
        return i < Math.floor(prefixLength / 8) ? 255 : parseInt('1'.repeat(prefixLength % 8).padEnd(8, '0'), 2);
    }).join('.');
}

function calculateNetworkAddress(ip, subnetMask) {
    const ipParts = ip.split('.').map(Number);
    const maskParts = subnetMask.split('.').map(Number);
    return ipParts.map((part, i) => part & maskParts[i]).join('.');
}

function calculateBroadcastAddress(networkAddress, subnetMask) {
    const netParts = networkAddress.split('.').map(Number);
    const maskParts = subnetMask.split('.').map(Number);
    return netParts.map((part, i) => part | (~maskParts[i] & 255)).join('.');
}

function calculateUsableAddress(address, offset) {
    const parts = address.split('.').map(Number);
    const intAddress = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const newIntAddress = intAddress + offset;
    return [
        (newIntAddress >>> 24) & 255,
        (newIntAddress >>> 16) & 255,
        (newIntAddress >>> 8) & 255,
        newIntAddress & 255
    ].join('.');
}

function toBinary(ip) {
    return ip.split('.').map(part => parseInt(part).toString(2).padStart(8, '0')).join('.');
}

function getWildcardMask(subnetMask) {
    return subnetMask.split('.').map(part => 255 - parseInt(part)).join('.');
}
