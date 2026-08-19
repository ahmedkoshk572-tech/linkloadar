# Mobile production check

On 2026-08-19, the published domain https://linkloadar-agnhqleq.manus.space/ was opened twice from the browser after the mobile fallback changes. The first extraction returned the LinkLoad shell, but the subsequent browser view showed `ERR_CONNECTION_CLOSED` / `This site can’t be reached`; command-line curl also returned OpenSSL `SSL_ERROR_SYSCALL`. The dev preview remains healthy and the mobile screenshot shows the app UI. Production connection should be rechecked after the latest checkpoint/deployment settles.
