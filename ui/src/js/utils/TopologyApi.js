
let url = 'http://www.filltext.com/?rows=5&domainName={firstName}&ip={ip}';
var TopologyApi = {
    fetch() {
        return (
            fetch(url)
                .then((res) => res.json())
        );
    }
}

export default Topology;
