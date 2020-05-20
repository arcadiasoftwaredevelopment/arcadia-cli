import {APIClient} from 'bitbucket'
import Credentials from './credentials.interface'

export default interface BitbucketCredentials {
    bitbucket: APIClient,
    credentials: Credentials
}