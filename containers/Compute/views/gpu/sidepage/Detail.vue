<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import {
  getReserveResourceColumn,
} from '../utils/columns'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GpuDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'model',
          title: this.$t('compute.text_482'),
        },
        {
          field: 'dev_type',
          title: this.$t('compute.text_481'),
        },
        {
          field: 'host',
          title: this.$t('compute.text_484'),
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) } id={row.host_id}>{ row.host }</side-page-trigger>,
              ]
            },
          },
        },
        {
          field: 'guest',
          title: this.$t('compute.text_483', [this.$t('dictionary.server')]),
          formatter: function ({ row }) {
            return row.guest || row.guest_id
          },
        },
        getReserveResourceColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('compute.text_497'),
          items: [
            {
              field: 'addr',
              title: 'PCI_BUS_ID',
            },
            {
              field: 'framebuffer',
              title: this.$t('gpu.device_type.framebuffer'),
            },
            {
              field: 'max_resolution',
              title: this.$t('gpu.device_type.max_resolution'),
            },
          ],
        },
      ],
    }
  },
  methods: {
    handleOpenSidepage (row) {
      this.initSidePageTab('host-detail')
      this.sidePageTriggerHandle(this, 'HostSidePage', {
        id: row.host_id,
        resource: 'hosts',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
