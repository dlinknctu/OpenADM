let url = 'http://www.filltext.com/?rows=5&domainName={firstName}&ip={ip}';
var ControllerFetcher = {
    fetch() {
        return (
            fetch(url)
                .then((res) => res.json())
        );
    }
}