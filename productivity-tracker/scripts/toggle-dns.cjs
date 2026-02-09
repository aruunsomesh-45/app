const { execSync } = require('child_process');
const os = require('os');
const platform = os.platform();

const OPENDNS_PRIMARY = '208.67.222.123';
const OPENDNS_SECONDARY = '208.67.220.123';

function getActiveInterface() {
    try {
        if (platform === 'win32') {
            const output = execSync('netsh interface ip show config').toString();
            // Simple heuristic: find interface with an IP address
            const sections = output.split('\n\n');
            for (const section of sections) {
                if (section.includes('IP Address') && !section.includes('Disconnected')) {
                    const match = section.match(/Configuration for interface "([^"]+)"/);
                    if (match) return match[1];
                }
            }
            return 'Wi-Fi'; // Default fallback
        }
    } catch (e) {
        console.error('Error detecting interface:', e.message);
    }
    return 'Wi-Fi';
}

function enableFilter() {
    console.log('🛡️  Enabling OpenDNS FamilyShield...');

    if (platform === 'win32') {
        const interfaceName = getActiveInterface();
        console.log(`Targeting interface: "${interfaceName}"`);

        try {
            // Set Primary
            execSync(`netsh interface ip set dns name="${interfaceName}" static ${OPENDNS_PRIMARY}`);
            // Add Secondary
            execSync(`netsh interface ip add dns name="${interfaceName}" ${OPENDNS_SECONDARY} index=2`, { stdio: 'ignore' }); // Ignore error if already set

            console.log('✅ DNS successfully set to OpenDNS.');
            console.log('   Primary: ' + OPENDNS_PRIMARY);
            console.log('   Secondary: ' + OPENDNS_SECONDARY);
            console.log('\n⚠️  You may need to run "ipconfig /flushdns" for changes to take effect immediately.');
        } catch (error) {
            console.error('❌ Failed to set DNS. Please run this script as Administrator.');
            // console.error(error.message);
        }
    } else {
        console.log('⚠️  Automatic configuration is currently only supported on Windows.');
        console.log(`Please manually set DNS to ${OPENDNS_PRIMARY} and ${OPENDNS_SECONDARY}`);
    }
}

function disableFilter() {
    console.log('🔓 Disabling DNS Filter (Reverting to DHCP)...');

    if (platform === 'win32') {
        const interfaceName = getActiveInterface();
        console.log(`Targeting interface: "${interfaceName}"`);

        try {
            execSync(`netsh interface ip set dns name="${interfaceName}" source=dhcp`);
            console.log('✅ DNS reverted to automatic (DHCP).');
            console.log('\n⚠️  You may need to run "ipconfig /flushdns" for changes to take effect immediately.');
        } catch (error) {
            console.error('❌ Failed to reset DNS. Please run this script as Administrator.');
        }
    } else {
        console.log('⚠️  Automatic configuration is currently only supported on Windows.');
    }
}

// CLI Argument Handling
const args = process.argv.slice(2);
if (args.includes('enable')) {
    enableFilter();
} else if (args.includes('disable')) {
    disableFilter();
} else {
    console.log('Usage: node scripts/toggle-dns.js [enable|disable]');
    console.log('\nOptions:');
    console.log('  enable   Set system DNS to OpenDNS FamilyShield IPs');
    console.log('  disable  Reset system DNS to automatic (DHCP)');
}
